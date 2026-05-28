# 04. ログインと新規登録

このアプリでは、ログインと新規登録に成功すると、バックエンドからJWTトークンが返ります。

フロントエンドはそのトークンを `localStorage` に保存し、以降のAPI通信で使います。

## 新規登録のフロント側

`RegisterPage.tsx` では、フォームの状態を `useState` で管理しています。

```ts
const [form, setForm] = useState<RegisterForm>({
  email: '',
  password: '',
  confirmPassword: '',
})
```

これは次の3つの入力値を保存します。

- `email`
- `password`
- `confirmPassword`

登録ボタンを押すと `handleSubmit` が動きます。

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (form.password !== form.confirmPassword) {
    setError('パスワードが一致しません')
    return
  }
  try {
    const res = await register(form.email, form.password)
    localStorage.setItem('token', res.token)
    navigate('/passwords')
  } catch {
    setError('登録に失敗しました。このメールアドレスはすでに使用されています')
  }
}
```

1行ずつ見ます。

```ts
const handleSubmit = async (e: React.FormEvent) => {
```

フォーム送信時に実行される関数です。

API通信をするので `async` を付けています。

```ts
e.preventDefault()
```

HTMLのフォームは、普通に送信するとページ全体を再読み込みします。

Reactでは再読み込みせずに処理したいので、`preventDefault()` で標準動作を止めています。

```ts
if (form.password !== form.confirmPassword) {
```

入力されたパスワードと確認用パスワードが一致しているか確認します。

```ts
setError('パスワードが一致しません')
return
```

一致しない場合はエラーメッセージを表示して、ここで処理を終了します。

```ts
const res = await register(form.email, form.password)
```

`register` API関数を呼び出します。

中ではAxiosで `POST /auth/register` を送っています。

```ts
localStorage.setItem('token', res.token)
```

バックエンドから返ってきたJWTトークンをブラウザに保存します。

```ts
navigate('/passwords')
```

登録成功後、パスワード一覧画面へ移動します。

## register API関数

`frontend/src/api/auth.ts` ではこう書かれています。

```ts
export const register = async (email: string, password: string) => {
  const res = await client.post('/auth/register', { email, password })
  return res.data
}
```

```ts
client.post('/auth/register', { email, password })
```

これはバックエンドに次のリクエストを送ります。

```txt
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "taro@example.com",
  "password": "password123"
}
```

## バックエンドのController

バックエンドでは `AuthController` が受け取ります。

```ts
@Post('register')
register(@Body() body: { email: string; password: string }) {
  return this.authService.register(body.email, body.password)
}
```

1行ずつ見ます。

```ts
@Post('register')
```

`POST /auth/register` に対応するメソッドです。

クラスに `@Controller('auth')` が付いているので、URLは `/auth/register` になります。

```ts
register(@Body() body: { email: string; password: string }) {
```

リクエストボディを `body` として受け取ります。

フロントから送った `{ email, password }` がここに入ります。

```ts
return this.authService.register(body.email, body.password)
```

実際の登録処理は `AuthService` に任せています。

Controllerは「受け取る係」、Serviceは「処理する係」です。

## AuthServiceの登録処理

```ts
async register(email: string, password: string) {
  const existing = await this.prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictException('このメールアドレスはすでに使用されています')
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await this.prisma.user.create({
    data: { email, password: hashed },
  })

  return { token: this.jwt.sign({ sub: user.id, email: user.email }) }
}
```

```ts
const existing = await this.prisma.user.findUnique({ where: { email } })
```

Prismaで `User` テーブルから同じメールアドレスのユーザーを探します。

`findUnique` は一意な値で1件探すメソッドです。

```ts
if (existing) {
```

すでに同じメールアドレスのユーザーがいた場合に中へ入ります。

```ts
throw new ConflictException(...)
```

HTTP 409 Conflictのエラーを返します。

```ts
const hashed = await bcrypt.hash(password, 10)
```

入力されたパスワードをbcryptでハッシュ化します。

`10` はハッシュ化の計算コストです。

```ts
const user = await this.prisma.user.create({
  data: { email, password: hashed },
})
```

Prismaで新しいユーザーを作成します。

DBには生のパスワードではなく、ハッシュ化された文字列が保存されます。

```ts
return { token: this.jwt.sign({ sub: user.id, email: user.email }) }
```

JWTトークンを作ってフロントに返します。

`sub` にはユーザーIDを入れています。

この `sub` があとで「どのユーザーか」を判断するために使われます。

## ログインの流れ

ログインもほぼ同じ流れです。

```txt
LoginPage
  ↓
login(email, password)
  ↓
POST /auth/login
  ↓
AuthController.login
  ↓
AuthService.login
  ↓
Prismaでユーザー検索
  ↓
bcrypt.compareでパスワード確認
  ↓
JWTトークンを返す
```

ログイン成功後も、フロントは同じようにtokenを保存します。

```ts
localStorage.setItem('token', res.token)
```

