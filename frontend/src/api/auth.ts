import client from './client'

// 新規登録
export const register = async (email: string, password: string) => {
  const res = await client.post('/auth/register', { email, password })
  return res.data
}

// ログイン
export const login = async (email: string, password: string) => {
  const res = await client.post('/auth/login', { email, password })
  return res.data
}