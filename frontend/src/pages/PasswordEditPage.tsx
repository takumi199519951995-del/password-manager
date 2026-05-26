import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PasswordForm } from '../types'
import { getPassword, updatePassword } from '../api/passwords'

function PasswordEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<PasswordForm>({
    serviceName: '',
    username: '',
    password: '',
    url: '',
    category: '',
    memo: '',
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPassword(id!)
        setForm({
          serviceName: data.serviceName,
          username: data.username,
          password: data.password,
          url: data.url ?? '',
          category: data.category ?? '',
          memo: data.memo ?? '',
        })
      } catch {
        navigate('/passwords')
      }
    }
    fetch()
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updatePassword(id!, form)
      navigate(`/passwords/${id}`)
    } catch {
      setError('更新に失敗しました')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(`/passwords/${id}`)}>← 戻る</button>
        <h1>編集</h1>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label>サービス名 *</label>
          <br />
          <input
            type="text"
            value={form.serviceName}
            onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>ユーザー名 *</label>
          <br />
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>パスワード *</label>
          <br />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ flex: 1, padding: '8px' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '隠す' : '表示'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>URL</label>
          <br />
          <input
            type="text"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>カテゴリ</label>
          <br />
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>メモ</label>
          <br />
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px', height: '80px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          保存
        </button>
      </form>
    </div>
  )
}

export default PasswordEditPage