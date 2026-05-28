# 05. パスワード一覧取得

この章では、パスワード一覧画面で何が起きているかを説明します。

対象ファイルは主に次の3つです。

- `frontend/src/pages/PasswordListPage.tsx`
- `frontend/src/api/passwords.ts`
- `backend/src/passwords/passwords.controller.ts`
- `backend/src/passwords/passwords.service.ts`

## 一覧取得の全体フロー

```txt
ユーザーが /passwords を開く
  ↓
PasswordListPage が表示される
  ↓
useEffect が動く
  ↓
getPasswords() を呼ぶ
  ↓
Axios が GET /passwords を送る
  ↓
AuthGuard がJWTトークンを確認する
  ↓
PasswordsController.findAll が動く
  ↓
PasswordsService.findAll が動く
  ↓
Prisma が Password テーブルから一覧を取得する
  ↓
フロントに一覧データが返る
  ↓
setPasswords(data) で画面に表示する
```

## フロント側のstate

一覧画面では、次のstateがあります。

```ts
const [search, setSearch] = useState('')
const [passwords, setPasswords] = useState<Password[]>([])
```

## search

```ts
const [search, setSearch] = useState('')
```

`search` は検索欄の文字を保存します。

最初は何も入力されていないので、初期値は空文字 `''` です。

例えばユーザーが検索欄に `gmail` と入力すると、`search` は `gmail` になります。

## passwords

```ts
const [passwords, setPasswords] = useState<Password[]>([])
```

`passwords` はAPIから取得したパスワード一覧を保存します。

`Password[]` は「Password型の配列」という意味です。

最初はまだAPIからデータを取得していないので、初期値は空配列 `[]` です。

## useEffectで一覧を取得する

```ts
useEffect(() => {
  const fetch = async () => {
    try {
      const data = await getPasswords()
      console.log('data', data)
      setPasswords(data)
    } catch {
      navigate('/')
    }
  }
  fetch()
}, [navigate])
```

1行ずつ見ます。

```ts
useEffect(() => {
```

画面表示後に実行したい処理を書きます。

```ts
const fetch = async () => {
```

API通信をするための非同期関数を作っています。

```ts
try {
```

API通信は失敗する可能性があるため、`try catch` で囲んでいます。

```ts
const data = await getPasswords()
```

`getPasswords()` を呼び出して、バックエンドから一覧を取得します。

`await` があるので、バックエンドから結果が返るまで次の行に進みません。

```ts
console.log('data', data)
```

取得したデータをブラウザの開発者ツールに表示します。

学習中は便利ですが、本番では消してもよい行です。

```ts
setPasswords(data)
```

取得した一覧を `passwords` state に保存します。

この行が実行されるとReactが再描画し、一覧が画面に出ます。

```ts
} catch {
  navigate('/')
}
```

API取得に失敗した場合、ログイン画面に戻します。

例えばJWTトークンがない場合、バックエンドは401エラーを返します。

その場合は `catch` に入り、`/` に移動します。

```ts
fetch()
```

作った `fetch` 関数を実行しています。

```ts
}, [navigate])
```

依存配列です。

`navigate` が変わったら再実行されます。

実際の理解としては「画面が開かれたら一覧を取りに行く」で大丈夫です。

## Axiosで一覧APIを呼ぶ

`frontend/src/api/passwords.ts` には次の関数があります。

```ts
export const getPasswords = async () => {
  const res = await client.get('/passwords')
  return res.data
}
```

```ts
client.get('/passwords')
```

Axiosで `GET /passwords` を送ります。

`client` の `baseURL` が `http://localhost:3000` なので、実際のURLは次です。

```txt
http://localhost:3000/passwords
```

また、Axiosのinterceptorにより、ログイン済みなら自動で次のヘッダーが付きます。

```txt
Authorization: Bearer JWTトークン
```

## バックエンドでJWTを確認する

`PasswordsController` にはクラス全体に `@UseGuards(AuthGuard)` が付いています。

```ts
@Controller('passwords')
@UseGuards(AuthGuard)
export class PasswordsController {
```

これは、`/passwords` 系のAPIにアクセスする前に、必ず `AuthGuard` を実行するという意味です。

`AuthGuard` は `Authorization` ヘッダーからJWTトークンを取り出し、正しいトークンか確認します。

成功すると、リクエストに `user` を追加します。

```ts
request.user = payload
```

この `payload` には、ログイン時にJWTへ入れた `sub` が入っています。

`sub` はユーザーIDです。

## Controllerで一覧取得を受け取る

```ts
@Get()
findAll(@Request() req: any) {
  return this.passwordsService.findAll(req.user.sub)
}
```

1行ずつ見ます。

```ts
@Get()
```

`GET /passwords` に対応します。

```ts
findAll(@Request() req: any) {
```

リクエスト全体を `req` として受け取ります。

`AuthGuard` が成功していれば、`req.user` が入っています。

```ts
return this.passwordsService.findAll(req.user.sub)
```

Serviceの `findAll` にユーザーIDを渡します。

`req.user.sub` はJWTに入っていたユーザーIDです。

つまり、「ログイン中のユーザーのパスワード一覧だけ取得する」という意味になります。

## ServiceでPrismaを使って一覧取得する

```ts
async findAll(userId: string) {
  return this.prisma.password.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}
```

```ts
async findAll(userId: string) {
```

`userId` を受け取る非同期関数です。

```ts
return this.prisma.password.findMany({
```

Prismaで `Password` テーブルから複数件取得します。

`findMany` は「条件に合うデータを複数取得する」メソッドです。

```ts
where: { userId },
```

`userId` が一致するデータだけ取得します。

これにより、他のユーザーのパスワードは取得されません。

```ts
orderBy: { createdAt: 'desc' },
```

`createdAt` の降順で並べます。

`desc` は新しい順です。

つまり、新しく登録したパスワードが上に表示されます。

## フロントで検索する

一覧を取得したあと、画面では検索処理をしています。

```ts
const filtered = passwords.filter((p) =>
  p.serviceName.toLowerCase().includes(search.toLowerCase())
)
```

```ts
passwords.filter(...)
```

`passwords` 配列から条件に合うものだけ残します。

```ts
(p) => ...
```

配列の1件1件を `p` として処理します。

```ts
p.serviceName.toLowerCase()
```

サービス名を小文字に変換します。

```ts
search.toLowerCase()
```

検索文字も小文字に変換します。

```ts
includes(...)
```

サービス名の中に検索文字が含まれているか確認します。

例えば、サービス名が `GitHub` で検索文字が `git` でも、小文字にそろえることで一致します。

## 一覧を表示する

```tsx
{filtered.map((password) => (
  <div
    key={password.id}
    onClick={() => navigate(`/passwords/${password.id}`)}
  >
    <div>{password.serviceName}</div>
    <div>{password.username}</div>
  </div>
))}
```

```tsx
filtered.map(...)
```

検索後の一覧を1件ずつ画面に表示します。

```tsx
key={password.id}
```

Reactが一覧の各要素を区別するためのIDです。

```tsx
onClick={() => navigate(`/passwords/${password.id}`)}
```

クリックしたら詳細画面に移動します。

例えばIDが `abc123` なら、次のURLへ移動します。

```txt
/passwords/abc123
```

