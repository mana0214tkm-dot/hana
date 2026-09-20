// 個人利用アプリ向けの簡易パスコード認証。
// AUTH_PASSWORD が未設定の場合は今まで通り誰でもアクセスできる(ローカル開発向けのフォールバック)。
// 公開デプロイ(Vercel等)では AUTH_PASSWORD と AUTH_SECRET を必ず設定すること。
import crypto from 'crypto'

export const SESSION_COOKIE_NAME = 'sodate_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30日
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_PASSWORD)
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function sign(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex')
}

// AUTH_SECRET が未設定でも(うっかり忘れても)署名自体は必ず機能するよう、
// AUTH_PASSWORD をフォールバックの署名鍵として使う。
function getSigningSecret(): string {
  return process.env.AUTH_SECRET || process.env.AUTH_PASSWORD || ''
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.AUTH_PASSWORD
  if (!expected || !password) return false
  return timingSafeEqualStr(password, expected)
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = String(expiresAt)
  const sig = sign(payload, getSigningSecret())
  return `${payload}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!isAuthConfigured()) return true
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload, getSigningSecret())
  if (!timingSafeEqualStr(sig, expected)) return false
  const expiresAt = Number(payload)
  return Number.isFinite(expiresAt) && Date.now() < expiresAt
}
