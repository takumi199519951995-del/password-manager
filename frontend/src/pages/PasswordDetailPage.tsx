import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Password } from '../types'

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

function PasswordDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const password = dummyPasswords.find((p) => p.id === id)

  if (!password) {
    return <div>パスワードが見つかりません</div>
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (confirm('削除しますか？')) {
      // 後でAPIと繋げる
      navigate('/passwords')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/passwords')}>← 戻る</button>
        <button onClick={() => navigate(`/passwords/${id}/edit`)}>編集</button>
      </div>

      <h1>{password.serviceName}</h1>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#666', fontSize: '14px' }}>ユーザー名</div>
        <div>{password.username}</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#666', fontSize: '14px' }}>パスワード</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>{showPassword ? password.password : '••••••••'}</div>
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '隠す' : '表示'}
          </button>
          <button onClick={handleCopy}>
            {copied ? 'コピー済み' : 'コピー'}
          </button>
        </div>
      </div>

      {password.url && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#666', fontSize: '14px' }}>URL</div>
          <div>{password.url}</div>
        </div>
      )}

      {password.memo && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#666', fontSize: '14px' }}>メモ</div>
          <div>{password.memo}</div>
        </div>
      )}

      <button
        onClick={handleDelete}
        style={{ color: 'red', marginTop: '32px' }}
      >
        削除
      </button>
    </div>
  )
}

export default PasswordDetailPage