# 07. 詳細表示・コピー・削除

この章では、パスワード詳細画面の流れを説明します。

対象ファイルは主に次の4つです。

- `frontend/src/pages/PasswordDetailPage.tsx`
- `frontend/src/api/passwords.ts`
- `backend/src/passwords/passwords.controller.ts`
- `backend/src/passwords/passwords.service.ts`

## 詳細表示の全体フロー

```txt
一覧画面で1件クリックする
  ↓
/passwords/:id に移動する
  ↓
PasswordDetailPage が表示される
  ↓
useParamsでURLのidを取得する
  ↓
useEffectで getPassword(id) を呼ぶ
  ↓
Axiosが GET /passwords/:id を送る
  ↓
バックエンドがidとuserIdで1件検索する
  ↓
見つかったデータを返す
  ↓
setPassword(data) で画面に表示する
```

## URLからidを取得する

```ts
const { id } = useParams()
```

`useParams` は、URLに含まれる値を取得するReact Routerの機能です。

このアプリのルーティングは次のようになっています。

```tsx
<Route path="/passwords/:id" element={<PasswordDetailPage />} />
```

`:id` の部分が動的な値です。

例えばURLがこうなら、

```txt
/passwords/abc123
```

`id` には `abc123` が入ります。

## 詳細データを保存するstate

```ts
const [password, setPassword] = useState<Password | null>(null)
```

`password` は詳細データを保存するstateです。

`Password | null` は「Password型、またはnull」という意味です。

最初はまだAPIから取得していないので `null` です。

```tsx
if (!password) {
  return <div>読み込み中...</div>
}
```

`password` がまだ `null` の間は、詳細画面ではなく「読み込み中...」を表示します。

## useEffectで詳細取得する

```ts
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
```

```ts
const data = await getPassword(id!)
```

URLから取得した `id` を使って、1件分のパスワード情報を取得します。

`id!` の `!` はTypeScriptに対して「ここではidは必ずある」と伝える書き方です。

```ts
setPassword(data)
```

取得した詳細データをstateに保存します。

これにより、画面にサービス名やユーザー名が表示されます。

## Axiosで詳細APIを呼ぶ

```ts
export const getPassword = async (id: string) => {
  const res = await client.get(`/passwords/${id}`)
  return res.data
}
```

```ts
client.get(`/passwords/${id}`)
```

指定したIDの詳細を取得します。

例えば `id` が `abc123` なら、次のAPIを呼びます。

```txt
GET http://localhost:3000/passwords/abc123
```

## Controllerでidを受け取る

```ts
@Get(':id')
findOne(@Param('id') id: string, @Request() req: any) {
  return this.passwordsService.findOne(id, req.user.sub)
}
```

```ts
@Get(':id')
```

`GET /passwords/:id` に対応します。

```ts
@Param('id') id: string
```

URLの `:id` 部分を取得します。

```ts
@Request() req: any
```

リクエスト全体を受け取ります。

`AuthGuard` が成功していれば `req.user.sub` にユーザーIDがあります。

```ts
this.passwordsService.findOne(id, req.user.sub)
```

詳細取得処理に、パスワードIDとユーザーIDを渡します。

## Serviceで1件検索する

```ts
async findOne(id: string, userId: string) {
  const password = await this.prisma.password.findFirst({
    where: { id, userId },
  })
  if (!password) {
    throw new NotFoundException('パスワードが見つかりません')
  }
  return password
}
```

```ts
this.prisma.password.findFirst({
```

Prismaで `Password` テーブルから1件探します。

```ts
where: { id, userId },
```

条件は2つです。

- `id` が一致すること
- `userId` がログイン中ユーザーのIDと一致すること

これが重要です。

もし `id` だけで検索すると、別ユーザーのパスワードIDを知っていた場合に取得できてしまう危険があります。

この実装では `userId` も条件に入れているため、自分のデータだけ取得できます。

```ts
if (!password) {
```

データが見つからなかった場合です。

```ts
throw new NotFoundException('パスワードが見つかりません')
```

HTTP 404 Not Foundを返します。

```ts
return password
```

見つかったパスワード情報を返します。

## パスワード表示・非表示

```ts
const [showPassword, setShowPassword] = useState(false)
```

パスワードを表示するかどうかを管理しています。

```tsx
<div>{showPassword ? password.password : '••••••••'}</div>
```

`showPassword` が `true` なら実際のパスワードを表示します。

`false` なら伏せ字を表示します。

```tsx
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? '隠す' : '表示'}
</button>
```

ボタンを押すと表示状態を切り替えます。

## コピー処理

```ts
const [copied, setCopied] = useState(false)
```

コピー済みかどうかを管理します。

```ts
const handleCopy = () => {
  navigator.clipboard.writeText(password.password)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

```ts
navigator.clipboard.writeText(password.password)
```

ブラウザのクリップボードにパスワード文字列を書き込みます。

```ts
setCopied(true)
```

コピー済み表示に切り替えます。

```ts
setTimeout(() => setCopied(false), 2000)
```

2秒後に `copied` を `false` に戻します。

そのため、ボタン表示が一時的に `コピー済み` になります。

## 削除の全体フロー

```txt
削除ボタンを押す
  ↓
confirmで確認する
  ↓
deletePassword(id) を呼ぶ
  ↓
Axiosが DELETE /passwords/:id を送る
  ↓
バックエンドがidとuserIdで対象を確認する
  ↓
Prismaで削除する
  ↓
/passwords に戻る
```

## フロントの削除処理

```ts
const handleDelete = async () => {
  if (confirm('削除しますか？')) {
    await deletePassword(id!)
    navigate('/passwords')
  }
}
```

```ts
confirm('削除しますか？')
```

ブラウザの確認ダイアログを表示します。

OKを押した場合だけ削除処理に進みます。

```ts
await deletePassword(id!)
```

削除APIを呼びます。

```ts
navigate('/passwords')
```

削除後に一覧画面へ戻ります。

## AxiosでDELETEする

```ts
export const deletePassword = async (id: string) => {
  const res = await client.delete(`/passwords/${id}`)
  return res.data
}
```

例えば `id` が `abc123` なら、次を送ります。

```txt
DELETE http://localhost:3000/passwords/abc123
```

## バックエンドの削除処理

Controllerです。

```ts
@Delete(':id')
remove(@Param('id') id: string, @Request() req: any) {
  return this.passwordsService.remove(id, req.user.sub)
}
```

Serviceです。

```ts
async remove(id: string, userId: string) {
  await this.findOne(id, userId)
  return this.prisma.password.delete({
    where: { id },
  })
}
```

```ts
await this.findOne(id, userId)
```

先に、そのデータがログイン中ユーザーのものか確認します。

見つからなければここで404エラーになります。

```ts
return this.prisma.password.delete({
  where: { id },
})
```

確認できたらPrismaで削除します。

`where: { id }` は「このIDのレコードを削除する」という意味です。

