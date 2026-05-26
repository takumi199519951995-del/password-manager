import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Password } from '../types'
import { getPasswords } from '../api/passwords'

function PasswordListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [passwords, setPasswords] = useState<Password[]>([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPasswords()
        setPasswords(data)
      } catch {
        navigate('/')
      }
    }
    fetch()
  }, [navigate])

  const filtered = passwords.filter((p) =>
    p.serviceName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Password Manager</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/passwords/new')}>+ 追加</button>
          <button onClick={() => navigate('/settings')}>設定</button>
        </div>
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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '32px' }}>
          パスワードが登録されていません
        </div>
      )}
    </div>
  )
}

export default PasswordListPage