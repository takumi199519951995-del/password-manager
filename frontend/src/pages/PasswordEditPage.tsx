import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PasswordForm, Password } from '../types'

// ダミーデータ（後でAPIと繋げる）
const dummyPasswords: Password[] = [
  {
    id: '1',
    serviceName: 'Amazon',
    username: 'user@email.com',
    password: 'password123',
    url: 'https://amazon.co.jp',
    memo: 'プライムあり',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    serviceName: 'Gmail',
    username: 'user@gmail.com',
    password: 'password456',
    url: 'https://gmail.com',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    serviceName: 'Netflix',
    username: 'user@email.com',
    password: 'password789',
    url: 'https://netflix.com',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
]

function PasswordEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [showPassword, setShowPassword] = useState(false)

  const target = dummyPasswords.find((p) => p.id === id)

  const [form, setForm] = useState<PasswordForm>({
    serviceName: target?.serviceName ?? '',
    username: target?.username ?? '',
    password: target?.password ?? '',
    url: target?.url ?? '',
    category: target?.category ?? '',
    memo: target?.memo ?? '',
  })

  if (!target) {
    return <div>パスワードが見つかりません</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 後でAPIと繋げる
    console.log('更新:', form)
    navigate(`/passwords/${id}`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(`/passwords/${id}`)}>← 戻る</button>
        <h1>編集</h1>
      </div>

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