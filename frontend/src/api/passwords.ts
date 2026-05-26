import client from './client'
import type { PasswordForm } from '../types'

// 一覧取得
export const getPasswords = async () => {
  const res = await client.get('/passwords')
  return res.data
}

// 詳細取得
export const getPassword = async (id: string) => {
  const res = await client.get(`/passwords/${id}`)
  return res.data
}

// 作成
export const createPassword = async (data: PasswordForm) => {
  const res = await client.post('/passwords', data)
  return res.data
}

// 更新
export const updatePassword = async (id: string, data: Partial<PasswordForm>) => {
  const res = await client.patch(`/passwords/${id}`, data)
  return res.data
}

// 削除
export const deletePassword = async (id: string) => {
  const res = await client.delete(`/passwords/${id}`)
  return res.data
}