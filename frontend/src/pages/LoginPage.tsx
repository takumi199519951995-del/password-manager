import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { LoginForm } from '../types'
import { login } from '../api/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await login(form.email, form.password)
      localStorage.setItem('token', res.token)
      navigate('/passwords')
    } catch {
      setError('メールアドレスまたはパスワードが間違っています')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <h1>Password Manager</h1>
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
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