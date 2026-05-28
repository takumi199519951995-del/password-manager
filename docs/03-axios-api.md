# 03. AxiosとAPI通信

Axiosは、フロントエンドからバックエンドAPIを呼び出すためのライブラリです。

このアプリでは、`frontend/src/api/client.ts` でAxiosの共通設定を作っています。

```ts
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:3000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
```

## import axios from 'axios'

```ts
import axios from 'axios'
```

Axiosライブラリを読み込んでいます。

Axiosを使うと、次のようにAPIを呼べます。

```ts
await axios.get('http://localhost:3000/passwords')
```

ただし、毎回 `http://localhost:3000` を書くのは大変です。

そこで、このアプリでは共通の `client` を作っています。

## axios.create

```ts
const client = axios.create({
  baseURL: 'http://localhost:3000',
})
```

これは、API通信用のAxiosインスタンスを作っています。

`baseURL` はAPIの基本URLです。

この設定があるため、別ファイルではこう書けます。

```ts
client.get('/passwords')
```

実際に送られるURLはこうなります。

```txt
http://localhost:3000/passwords
```

## interceptorとは

```ts
client.interceptors.request.use((config) => {
```

`interceptors.request` は、リクエストを送る直前に処理を挟む仕組みです。

このアプリでは、すべてのAPIリクエストにJWTトークンを自動で付けるために使っています。

## localStorageからtokenを取得する

```ts
const token = localStorage.getItem('token')
```

ブラウザの `localStorage` から `token` を取り出しています。

ログイン成功時、このアプリは次のようにtokenを保存しています。

```ts
localStorage.setItem('token', res.token)
```

そのため、ログイン後は `localStorage.getItem('token')` でtokenを取り出せます。

## Authorizationヘッダーを付ける

```ts
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

tokenが存在する場合、HTTPヘッダーに `Authorization` を追加しています。

実際には次のようなヘッダーになります。

```txt
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

`Bearer` は「このtokenを持っている人として認証してください」という意味でよく使われる形式です。

## configを返す

```ts
return config
```

変更したリクエスト設定をAxiosに返します。

これを返さないと、Axiosはどんな設定でリクエストを送ればよいかわからなくなります。

## API関数の例

`frontend/src/api/passwords.ts` では、次のようなAPI関数があります。

```ts
export const getPasswords = async () => {
  const res = await client.get('/passwords')
  return res.data
}
```

1行ずつ見ます。

```ts
export const getPasswords = async () => {
```

`getPasswords` という関数を外部から使えるようにしています。

`async` が付いているので、関数の中で `await` が使えます。

```ts
const res = await client.get('/passwords')
```

Axiosで `GET /passwords` を呼び出しています。

`client` には `baseURL` が設定されているので、実際には次のURLにアクセスします。

```txt
http://localhost:3000/passwords
```

```ts
return res.data
```

Axiosのレスポンスには、ステータスコードやヘッダーなども含まれます。

そのうち、バックエンドが返したJSON本体は `res.data` に入っています。

画面側ではJSON本体だけ欲しいので、`res.data` を返しています。

## GET / POST / PATCH / DELETE

このアプリでは、次のHTTPメソッドを使っています。

```txt
GET
  データを取得する

POST
  新しいデータを作成する

PATCH
  既存データの一部を更新する

DELETE
  データを削除する
```

具体的にはこうです。

```ts
client.get('/passwords')
client.get(`/passwords/${id}`)
client.post('/passwords', data)
client.patch(`/passwords/${id}`, data)
client.delete(`/passwords/${id}`)
```

