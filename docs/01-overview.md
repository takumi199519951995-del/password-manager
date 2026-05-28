# 01. 全体の処理フロー

このアプリでは、画面操作からDB保存までが次の順番で進みます。

```txt
ユーザーが画面を操作する
  ↓
Reactのイベント処理が動く
  ↓
useStateで画面の状態を更新する
  ↓
AxiosでバックエンドAPIを呼ぶ
  ↓
NestJSのControllerがリクエストを受け取る
  ↓
Serviceに処理を任せる
  ↓
PrismaでSQLiteを操作する
  ↓
DBの結果をバックエンドが返す
  ↓
Axiosがレスポンスを受け取る
  ↓
ReactがsetStateして画面を更新する
```

## フロントエンドの役割

フロントエンドは `frontend/src` にあります。

主な役割は次の3つです。

- 画面を表示する
- ユーザーの入力を受け取る
- APIを呼び出してデータを取得・保存する

例えば、パスワード一覧画面は `frontend/src/pages/PasswordListPage.tsx` です。

この画面では、画面が開かれたタイミングでバックエンドに「パスワード一覧をください」とリクエストします。

## バックエンドの役割

バックエンドは `backend/src` にあります。

主な役割は次の4つです。

- APIのURLを用意する
- リクエストの中身を受け取る
- JWTトークンを確認してログイン済みか判定する
- Prismaを使ってDBを操作する

例えば、パスワード一覧取得APIは `backend/src/passwords/passwords.controller.ts` にあります。

```ts
@Get()
findAll(@Request() req: any) {
  return this.passwordsService.findAll(req.user.sub)
}
```

このコードは、`GET /passwords` にアクセスされたときに動きます。

## DBの役割

DBはSQLiteです。

Prismaのschemaでは、次の2つのモデルがあります。

- `User`
- `Password`

`User` はログインするユーザー情報です。

`Password` はそのユーザーが登録したサービス名、ユーザー名、パスワード、URL、メモなどです。

```prisma
model Password {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  serviceName String
  username    String
  password    String
  url         String?
  category    String?
  memo        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 重要な認証の流れ

ログインすると、バックエンドはJWTトークンを返します。

フロントエンドはそのトークンを `localStorage` に保存します。

```ts
localStorage.setItem('token', res.token)
```

その後、パスワード一覧取得や登録をするとき、Axiosが自動でHTTPヘッダーにトークンを付けます。

```txt
Authorization: Bearer xxxxxxxx
```

バックエンドはこのトークンを確認し、「どのユーザーのリクエストか」を判断します。

