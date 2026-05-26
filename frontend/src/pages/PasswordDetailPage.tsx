import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Password } from '../types'
import { getPassword, deletePassword } from '../api/passwords'

function PasswordDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [password, setPassword] = useState<Password | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPassword(id!)
        setPassword(data)
      } catch {
        navigate('/passwords')
      }
    }
    fetch()
  }, [id, navigate])

  if (!password) {
    return <div>読み込み中...</div>
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (confirm('削除しますか？')) {
      await deletePassword(id!)
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