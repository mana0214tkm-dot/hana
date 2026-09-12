// データベース接続(libSQL / Turso対応)。
// これまでの localStorage 保存 → ローカルSQLite(better-sqlite3) から、
// さらにクラウド対応のTurso(libSQL)へ移行した。
//
// - 環境変数 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN が設定されている場合は、
//   Tursoのクラウドデータベースに接続する(本番/Vercelデプロイ向け)。
// - 未設定の場合は、これまで通りローカルの data/app.db ファイルにフォールバックする
//   (ローカル開発はTursoアカウント無しでもそのまま動く)。
//
// スキーマ構成:
//  - logs        : 生の記録(OLTP的なファクトテーブル)
//  - log_photos  : 1記録につき複数枚の写真を持てるよう分離した子テーブル
//  - dwh_*       : 分析用に事前集計しておくデータウェアハウス層。
//                   logs への INSERT/DELETE に連動するトリガーで自動更新され、
//                   分析API はここを読むだけで済むため、記録が増えても集計が軽い。
import path from 'path'
import fs from 'fs'
import { createClient, type Client } from '@libsql/client'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'app.db')

declare global {
  // Next.js の開発モードではモジュールが再読み込みされるため、
  // グローバルに接続とスキーマ初期化状態をキャッシュして多重初期化を防ぐ。
  var __sodateDb: Client | undefined
  var __sodateDbReady: Promise<void> | undefined
}

function resolveConnectionConfig(): { url: string; authToken?: string } {
  if (process.env.TURSO_DATABASE_URL) {
    return { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN }
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  return { url: `file:${DB_PATH}` }
}

function createConnection(): Client {
  const { url, authToken } = resolveConnectionConfig()
  return createClient({ url, authToken })
}

async function initSchema(db: Client): Promise<void> {
  await db.execute(`PRAGMA foreign_keys = ON`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      pillar TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      xp INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      photo TEXT
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_logs_pillar ON logs (pillar)`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS log_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_log_photos_log_id ON log_photos (log_id)`)

  // ── データウェアハウス層(事前集計テーブル) ──
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dwh_daily_pillar_stats (
      date TEXT NOT NULL,
      pillar TEXT NOT NULL,
      log_count INTEGER NOT NULL DEFAULT 0,
      xp_sum INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (date, pillar)
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dwh_category_stats (
      pillar TEXT NOT NULL,
      category TEXT NOT NULL,
      log_count INTEGER NOT NULL DEFAULT 0,
      xp_sum INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (pillar, category)
    )
  `)

  // logs への INSERT / DELETE をトリガーで拾い、集計テーブルを自動更新する。
  // (簡易ETL: 生ログを書き込むたびに増分だけ反映するのでフルスキャンが不要)
  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS trg_logs_ai AFTER INSERT ON logs BEGIN
      INSERT INTO dwh_daily_pillar_stats (date, pillar, log_count, xp_sum)
      VALUES (NEW.date, NEW.pillar, 1, NEW.xp)
      ON CONFLICT(date, pillar) DO UPDATE SET
        log_count = log_count + 1,
        xp_sum = xp_sum + NEW.xp;

      INSERT INTO dwh_category_stats (pillar, category, log_count, xp_sum)
      VALUES (NEW.pillar, NEW.category, 1, NEW.xp)
      ON CONFLICT(pillar, category) DO UPDATE SET
        log_count = log_count + 1,
        xp_sum = xp_sum + NEW.xp;
    END;
  `)
  await db.execute(`
    CREATE TRIGGER IF NOT EXISTS trg_logs_ad AFTER DELETE ON logs BEGIN
      UPDATE dwh_daily_pillar_stats SET
        log_count = log_count - 1,
        xp_sum = xp_sum - OLD.xp
      WHERE date = OLD.date AND pillar = OLD.pillar;
      DELETE FROM dwh_daily_pillar_stats WHERE date = OLD.date AND pillar = OLD.pillar AND log_count <= 0;

      UPDATE dwh_category_stats SET
        log_count = log_count - 1,
        xp_sum = xp_sum - OLD.xp
      WHERE pillar = OLD.pillar AND category = OLD.category;
      DELETE FROM dwh_category_stats WHERE pillar = OLD.pillar AND category = OLD.category AND log_count <= 0;
    END;
  `)

  await migrateLegacySinglePhoto(db)
}

// 旧バージョンで logs.photo (単数カラム) に入っていた写真を log_photos へ移す。
// 既に移行済みなら何もしない(冪等)。
async function migrateLegacySinglePhoto(db: Client): Promise<void> {
  await db.execute(`
    INSERT INTO log_photos (log_id, data, position, created_at)
    SELECT id, photo, 0, created_at FROM logs
    WHERE photo IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM log_photos WHERE log_photos.log_id = logs.id)
  `)
  await db.execute(`UPDATE logs SET photo = NULL WHERE photo IS NOT NULL`)
}

export async function getDb(): Promise<Client> {
  if (!globalThis.__sodateDb) {
    globalThis.__sodateDb = createConnection()
    globalThis.__sodateDbReady = initSchema(globalThis.__sodateDb)
  }
  await globalThis.__sodateDbReady
  return globalThis.__sodateDb
}
