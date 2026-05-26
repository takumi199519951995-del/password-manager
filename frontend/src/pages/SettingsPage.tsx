import { useNavigate } from 'react-router-dom'

function SettingsPage() {
  const navigate = useNavigate()

  const email = localStorage.getItem('email') ?? 'ユーザー'

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      localStorage.removeItem('token')
      navigate('/')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/passwords')}>← 戻る</button>
        <h1>設定</h1>
      </div>

      <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <div style={{ color: '#666', fontSize: '14px' }}>アカウント情報</div>
        <div>{email}</div>
      </div>

      <button
        onClick={handleLogout}
        style={{ color: 'red', padding: '10px', width: '100%' }}
      >
        ログアウト
      </button>
    </div>
  )
}

export default SettingsPage