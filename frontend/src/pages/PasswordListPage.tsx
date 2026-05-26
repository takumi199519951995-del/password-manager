import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Password } from '../types'

// ダミーデータ（後でAPIと繋げる）
const dummyPasswords: Password[] = [
  {
    id: '1',
    serviceName: 'Amazon',
    username: 'user@email.com',
    password: 'password123',
    url: 'https://amazon.co.jp',
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

function PasswordListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [passwords] = useState<Password[]>(dummyPasswords)

  const filtered = passwords.filter((p) =>
    p.serviceName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Password Manager</h1>
        <button onClick={() => navigate('/passwords/new')}>+ 追加</button>
      </div>

      <input
        type="text"
        placeholder="検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
      />

      {filtered.map((password) => (
        <div
          key={password.id}
          onClick={() => navigate(`/passwords/${password.id}`)}
          style={{
            padding: '16px',
            marginBottom: '8px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{password.serviceName}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>{password.username}</div>
        </div>
      ))}
    </div>
  )
}

export default PasswordListPage