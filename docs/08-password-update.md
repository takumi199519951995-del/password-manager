# 08. パスワード編集・更新

この章では、既存のパスワード情報を編集する流れを説明します。

対象ファイルは主に次の4つです。

- `frontend/src/pages/PasswordEditPage.tsx`
- `frontend/src/api/passwords.ts`
- `backend/src/passwords/passwords.controller.ts`
- `backend/src/passwords/passwords.service.ts`

## 更新の全体フロー

```txt
詳細画面で編集ボタンを押す
  ↓
/passwords/:id/edit に移動する
  ↓
useParamsでidを取得する
  ↓
useEffectで現在のデータを取得する
  ↓
取得したデータをsetFormでフォームに入れる
  ↓
ユーザーがフォームを編集する
  ↓
保存ボタンを押す
  ↓
updatePassword(id, form) を呼ぶ
  ↓
Axiosが PATCH /passwords/:id を送る
  ↓
バックエンドがログイン中ユーザーのデータか確認する
  ↓
Prismaで更新する
  ↓
詳細画面に戻る
```

## 編集画面のstate

```ts
const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState('')
const [form, setForm] = useState<PasswordForm>({
  serviceName: '',
  username: '',
  password: '',
  url: '',
  category: '',
  memo: '',
})
```

## showPassword

```ts
const [showPassword, setShowPassword] = useState(false)
```

パスワード入力欄を表示するか隠すかを管理します。

## error

```ts
const [error, setError] = useState('')
```

更新に失敗したときのエラーメッセージを保存します。

空文字のときは何も表示しません。

## form

```ts
const [form, setForm] = useState<PasswordForm>({
  serviceName: '',
  username: '',
  password: '',
  url: '',
  category: '',
  memo: '',
})
```

編集フォームの入力内容です。

最初は空ですが、画面表示後にAPIで既存データを取得し、`setForm` で埋めます。

## URLからidを取得する

```ts
const { id } = useParams()
```

URLの `:id` を取得します。

例えばURLが次なら、

```txt
/passwords/abc123/edit
```

`id` は `abc123` になります。

## useEffectで既存データを取得する

```ts
useEffect(() => {
  const fetch = async () => {
    try {
      const data = await getPassword(id!)
      setForm({
        serviceName: data.serviceName,
        username: data.username,
        password: data.password,
        url: data.url ?? '',
        category: data.category ?? '',
        memo: data.memo ?? '',
      })
    } catch {
      navigate('/passwords')
    }
  }
  fetch()
}, [id, navigate])
```

```ts
const data = await getPassword(id!)
```

編集対象の現在のデータをバックエンドから取得します。

```ts
setForm({
```

取得したデータをフォームにセットします。

これにより、編集画面を開いたときに既存のサービス名やユーザー名が入力済みの状態になります。

```ts
serviceName: data.serviceName,
username: data.username,
password: data.password,
```

DBから取得した値をそのままフォームに入れています。

```ts
url: data.url ?? '',
```

`??` はNull合体演算子です。

`data.url` が `null` または `undefined` の場合、空文字 `''` を使います。

Reactの入力欄では、`undefined` より空文字のほうが扱いやすいためです。

```ts
category: data.category ?? '',
memo: data.memo ?? '',
```

カテゴリとメモも同じです。

DB上で値がない場合は空文字にします。

## 入力変更時にformを更新する

```tsx
onChange={(e) => setForm({ ...form, username: e.target.value })}
```

これは「今のformをコピーし、usernameだけ新しい入力値に変更する」という意味です。

編集画面では、サービス名、ユーザー名、パスワード、URL、カテゴリ、メモすべてで同じ考え方を使っています。

## 保存ボタンを押したとき

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await updatePassword(id!, form)
    navigate(`/passwords/${id}`)
  } catch {
    setError('更新に失敗しました')
  }
}
```

```ts
e.preventDefault()
```

フォーム送信によるページ再読み込みを防ぎます。

```ts
await updatePassword(id!, form)
```

更新APIを呼びます。

`id` は更新対象のIDです。

`form` は更新後の入力内容です。

```ts
navigate(`/passwords/${id}`)
```

更新成功後、詳細画面へ戻ります。

```ts
setError('更新に失敗しました')
```

更新に失敗したらエラーを表示します。

## AxiosでPATCHする

```ts
export const updatePassword = async (id: string, data: Partial<PasswordForm>) => {
  const res = await client.patch(`/passwords/${id}`, data)
  return res.data
}
```

```ts
Partial<PasswordForm>
```

`PasswordForm` の一部だけでもよい、というTypeScriptの型です。

今回の画面ではフォーム全体を送っていますが、型としては一部更新にも対応できます。

```ts
client.patch(`/passwords/${id}`, data)
```

`PATCH /passwords/:id` に更新データを送ります。

例えば `id` が `abc123` なら、次のようなリクエストです。

```txt
PATCH http://localhost:3000/passwords/abc123
Authorization: Bearer JWTトークン
Content-Type: application/json

{
  "serviceName": "GitHub",
  "username": "new@example.com",
  "password": "new-password",
  "url": "https://github.com",
  "category": "開発",
  "memo": "更新したメモ"
}
```

## Controllerで更新を受け取る

```ts
@Patch(':id')
update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
  return this.passwordsService.update(id, req.user.sub, body)
}
```

```ts
@Patch(':id')
```

`PATCH /passwords/:id` に対応します。

```ts
@Param('id') id: string
```

URLから更新対象IDを取得します。

```ts
@Body() body: any
```

フロントから送られた更新データを受け取ります。

```ts
@Request() req: any
```

リクエスト情報を受け取ります。

`req.user.sub` にログイン中ユーザーのIDがあります。

```ts
this.passwordsService.update(id, req.user.sub, body)
```

Serviceに、ID、ユーザーID、更新データを渡します。

## ServiceでPrisma更新する

```ts
async update(id: string, userId: string, data: {
  serviceName?: string
  username?: string
  password?: string
  url?: string
  category?: string
  memo?: string
}) {
  await this.findOne(id, userId)
  return this.prisma.password.update({
    where: { id },
    data,
  })
}
```

```ts
async update(id: string, userId: string, data: {...}) {
```

更新対象ID、ログイン中ユーザーID、更新データを受け取ります。

```ts
serviceName?: string
```

`?` は省略可能という意味です。

つまり、`serviceName` があってもなくてもよいという型です。

```ts
await this.findOne(id, userId)
```

先に対象データを確認します。

ここで `id` と `userId` の両方を条件に検索するため、他のユーザーのデータを更新できません。

```ts
return this.prisma.password.update({
```

Prismaで更新します。

```ts
where: { id },
```

更新対象のIDを指定します。

```ts
data,
```

更新する内容です。

例えば `data` がこうなら、

```ts
{
  username: 'new@example.com',
  memo: '更新したメモ'
}
```

Prismaは該当レコードの `username` と `memo` を更新します。

## なぜ先にfindOneするのか

更新自体は `where: { id }` だけで行っています。

その前に `findOne(id, userId)` を呼ぶことで、次を確認しています。

```txt
このidのデータは存在するか
そのデータはログイン中ユーザーのものか
```

この確認があるため、自分以外のデータを更新しにくい実装になっています。

