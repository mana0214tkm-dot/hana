'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('パスワードが違います')
        return
      }
      router.push('/')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>人生ときめき育成記</h1>
        <input
          type="password"
          autoFocus
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
        />
        {error && <p style={{ color: '#c0392b', fontSize: 14 }}>{error}</p>}
        <button
          type="submit"
          disabled={pending || password.length === 0}
          style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#333', color: '#fff' }}
        >
          {pending ? '確認中...' : 'はいる'}
        </button>
      </form>
    </div>
  )
}
