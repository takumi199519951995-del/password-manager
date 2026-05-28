# 06. パスワード新規登録

この章では、パスワードを新しく登録する流れを説明します。

対象ファイルは主に次の4つです。

- `frontend/src/pages/PasswordNewPage.tsx`
- `frontend/src/api/passwords.ts`
- `backend/src/passwords/passwords.controller.ts`
- `backend/src/passwords/passwords.service.ts`

## 新規登録の全体フロー

```txt
ユーザーが /passwords/new を開く
  ↓
フォームにサービス名・ユーザー名・パスワードなどを入力する
  ↓
useStateのformが入力内容を保存する
  ↓
保存ボタンを押す
  ↓
handleSubmitが動く
  ↓
createPassword(form) を呼ぶ
  ↓
Axiosが POST /passwords を送る
  ↓
AuthGuardがJWTトークンを確認する
  ↓
PasswordsController.createが受け取る
  ↓
PasswordsService.createがPrismaでDBに保存する
  ↓
保存成功後、/passwords に戻る
```

## フォームのstate

新規登録画面では、フォーム入力を `form` stateで管理しています。

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

この `form` は、登録フォーム全体の入力内容です。

```ts
serviceName
```

サービス名です。

例: `GitHub`, `Gmail`, `Amazon`

```ts
username
```

ログインに使うユーザー名やメールアドレスです。

```ts
password
```

保存したいパスワードです。

```ts
url
```

ログインページなどのURLです。

```ts
category
```

分類用のカテゴリです。

例: `仕事`, `SNS`, `買い物`

```ts
memo
```

自由入力のメモです。

## 入力欄でformを更新する

サービス名の入力欄はこう書かれています。

```tsx
<input
  type="text"
  value={form.serviceName}
  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
  required
/>
```

1行ずつ見ます。

```tsx
type="text"
```

テキスト入力欄です。

```tsx
value={form.serviceName}
```

入力欄に表示する値を `form.serviceName` にしています。

```tsx
onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
```

入力内容が変わるたびに、`form.serviceName` を更新します。

```ts
{ ...form, serviceName: e.target.value }
```

これは「今のformをコピーして、serviceNameだけ新しい値にする」という意味です。

例えば、入力前のformがこうだったとします。

```ts
{
  serviceName: '',
  username: 'taro@example.com',
  password: 'abc123',
  url: '',
  category: '',
  memo: ''
}
```

サービス名に `GitHub` と入力すると、こうなります。

```ts
{
  serviceName: 'GitHub',
  username: 'taro@example.com',
  password: 'abc123',
  url: '',
  category: '',
  memo: ''
}
```

他の項目は消えずに残ります。

## パスワード表示切り替え

```ts
const [showPassword, setShowPassword] = useState(false)
```

`showPassword` は、パスワードを表示するか隠すかを保存するstateです。

初期値は `false` なので、最初は隠します。

```tsx
type={showPassword ? 'text' : 'password'}
```

この行は三項演算子です。

```txt
showPasswordがtrueなら text
showPasswordがfalseなら password
```

`type="password"` のときは、入力内容が伏せ字になります。

`type="text"` のときは、入力内容が見えます。

```tsx
<button type="button" onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? '隠す' : '表示'}
</button>
```

ボタンを押すと `showPassword` を反転します。

`false` なら `true` に、`true` なら `false` になります。

## 保存ボタンを押したとき

フォームには `onSubmit` があります。

```tsx
<form onSubmit={handleSubmit}>
```

保存ボタンを押すと `handleSubmit` が実行されます。

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await createPassword(form)
    navigate('/passwords')
  } catch {
    setError('保存に失敗しました')
  }
}
```

1行ずつ見ます。

```ts
const handleSubmit = async (e: React.FormEvent) => {
```

フォーム送信時に動く関数です。

API通信をするため `async` が付いています。

```ts
e.preventDefault()
```

フォーム送信によるページ再読み込みを防ぎます。

```ts
try {
```

保存処理は失敗する可能性があるので、`try catch` で囲みます。

```ts
await createPassword(form)
```

入力内容が入った `form` をAPIに送ります。

`await` があるので、保存が終わるまで次の行に進みません。

```ts
navigate('/passwords')
```

保存に成功したら一覧画面に戻ります。

```ts
} catch {
  setError('保存に失敗しました')
}
```

保存に失敗した場合、エラーメッセージを表示します。

## AxiosでPOSTする

API関数はこうです。

```ts
export const createPassword = async (data: PasswordForm) => {
  const res = await client.post('/passwords', data)
  return res.data
}
```

```ts
data: PasswordForm
```

`data` はフォーム入力内容です。

```ts
client.post('/passwords', data)
```

`POST /passwords` にデータを送ります。

実際のリクエストはこういうイメージです。

```txt
POST http://localhost:3000/passwords
Authorization: Bearer JWTトークン
Content-Type: application/json

{
  "serviceName": "GitHub",
  "username": "taro@example.com",
  "password": "abc123",
  "url": "https://github.com",
  "category": "開発",
  "memo": "個人アカウント"
}
```

## Controllerで受け取る

```ts
@Post()
create(@Body() body: any, @Request() req: any) {
  return this.passwordsService.create(req.user.sub, body)
}
```

```ts
@Post()
```

`POST /passwords` に対応します。

```ts
create(@Body() body: any, @Request() req: any) {
```

`@Body()` でフロントから送られたJSONを受け取ります。

`@Request()` でリクエスト全体を受け取ります。

```ts
req.user.sub
```

JWTトークンから取り出したユーザーIDです。

```ts
body
```

フロントから送られたフォームデータです。

```ts
return this.passwordsService.create(req.user.sub, body)
```

ユーザーIDとフォームデータをServiceに渡します。

## ServiceでDBに保存する

```ts
async create(userId: string, data: {
  serviceName: string
  username: string
  password: string
  url?: string
  category?: string
  memo?: string
}) {
  return this.prisma.password.create({
    data: { userId, ...data },
  })
}
```

```ts
async create(userId: string, data: {...}) {
```

ユーザーIDと登録データを受け取ります。

```ts
return this.prisma.password.create({
```

Prismaで `Password` テーブルに新しいレコードを作成します。

```ts
data: { userId, ...data },
```

DBに保存する内容です。

`userId` はログイン中のユーザーIDです。

`...data` はフロントから送られたフォーム内容を展開しています。

例えば `data` がこうなら、

```ts
{
  serviceName: 'GitHub',
  username: 'taro@example.com',
  password: 'abc123'
}
```

`{ userId, ...data }` はこうなります。

```ts
{
  userId: 'ログイン中のユーザーID',
  serviceName: 'GitHub',
  username: 'taro@example.com',
  password: 'abc123'
}
```

これにより、作成されたパスワードは必ずログイン中ユーザーに紐づきます。

