'use client'
import { useRef, useState } from 'react'
import type { Pillar } from '@/types'
import { useStore } from '@/store/useStore'
import { compressImage } from '@/lib/image'

const MAX_PHOTOS = 4

// key={pillar.id} を親から渡すことで、柱の切り替え時にコンポーネントごと
// 再初期化し、常にその柱の先頭カテゴリから始まるようにしている。
export default function LogForm({ pillar }: { pillar: Pillar }) {
  const addLog = useStore(s => s.addLog)
  const [categoryId, setCategoryId] = useState(pillar.categories[0].id)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoError, setPhotoError] = useState('')
  const [processingPhoto, setProcessingPhoto] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addLog(pillar.id, categoryId, title, note, photos)
    setTitle('')
    setNote('')
    setPhotos([])
    setPhotoError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    if (fileInputRef.current) fileInputRef.current.value = ''

    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setPhotoError(`写真は${MAX_PHOTOS}枚まで添付できます`)
      return
    }
    const targets = files.slice(0, room)
    if (files.length > targets.length) {
      setPhotoError(`写真は${MAX_PHOTOS}枚まで添付できます`)
    } else {
      setPhotoError('')
    }

    const invalid = targets.some(f => !f.type.startsWith('image/'))
    if (invalid) {
      setPhotoError('画像ファイルを選択してください')
      return
    }

    setProcessingPhoto(true)
    try {
      const compressed = await Promise.all(targets.map(f => compressImage(f)))
      setPhotos(prev => [...prev, ...compressed])
    } catch {
      setPhotoError('画像の読み込みに失敗しました')
    } finally {
      setProcessingPhoto(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const info = pillar.categories.find(c => c.id === categoryId) ?? pillar.categories[0]

  return (
    <form className={`card log-form ${pillar.theme} ${justAdded ? 'pop' : ''}`} onSubmit={handleSubmit}>
      <div className="card-title">{pillar.label}の記録を残す</div>

      <div className="category-picker">
        {pillar.categories.map(c => (
          <button
            type="button"
            key={c.id}
            className={`pill ${categoryId === c.id ? 'active' : ''}`}
            onClick={() => setCategoryId(c.id)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <p className="category-hint">{info.hint}</p>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="例: 一次面接を受けた / デートに行った"
        maxLength={60}
      />
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="メモ(任意): 気づいたこと、うれしかったことなど"
        maxLength={200}
      />

      <div className="photo-field">
        {photos.length > 0 && (
          <div className="photo-preview-list">
            {photos.map((p, i) => (
              <div className="photo-preview" key={i}>
                <img src={p} alt={`添付した写真${i + 1}のプレビュー`} />
                <button type="button" className="btn-icon photo-remove" onClick={() => removePhoto(i)} aria-label="写真を削除">✕</button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label className="photo-upload-btn">
            📷 写真を追加(任意・最大{MAX_PHOTOS}枚)
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              hidden
            />
          </label>
        )}
        {processingPhoto && <p className="photo-status">画像を処理中...</p>}
        {photoError && <p className="photo-status photo-status-error">{photoError}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
        記録して育てる (+{info.baseXp}pt)
      </button>
    </form>
  )
}
