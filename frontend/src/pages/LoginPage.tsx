import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { LoginForm } from '../types'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ログイン:', form)
    navigate('/passwords')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <h1>Password Manager</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>メールアドレス</label>
          <br />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        <br />
        <div>
          <label>パスワード</label>
          <br />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        <br />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          ログイン
        </button>
      </form>
      <br />
      <Link to="/register">新規登録はこちら</Link>
    </div>
  )
}

export default LoginPage