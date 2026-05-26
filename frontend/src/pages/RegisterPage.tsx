import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { RegisterForm } from '../types'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      alert('パスワードが一致しません')
      return
    }
    // 後でAPIと繋げる
    console.log('新規登録:', form)
    navigate('/')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
      <h1>新規登録</h1>
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
        <div>
          <label>パスワード確認</label>
          <br />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        <br />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          登録
        </button>
      </form>
      <br />
      <Link to="/">ログインはこちら</Link>
    </div>
  )
}

export default RegisterPage