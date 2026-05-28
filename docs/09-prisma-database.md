# 09. PrismaとDB操作

この章では、Prismaが何をしているのか、どの構文でDBを操作しているのかを説明します。

## Prismaとは

Prismaは、TypeScriptやJavaScriptからDBを操作しやすくするためのライブラリです。

普通にSQLを書くと、例えばこうなります。

```sql
SELECT * FROM Password WHERE userId = 'user-1';
```

Prismaを使うと、TypeScriptでこう書けます。

```ts
this.prisma.password.findMany({
  where: { userId: 'user-1' },
})
```

つまりPrismaは、TypeScriptのコードからDBに命令を送るための橋渡し役です。

## schema.prisma

DBの構造は `backend/prisma/schema.prisma` に書かれています。

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

```prisma
provider = "sqlite"
```

このアプリではSQLiteを使うという意味です。

```prisma
url = env("DATABASE_URL")
```

DBの接続先を環境変数 `DATABASE_URL` から読み取るという意味です。

ローカルで動かす場合は、通常 `backend/.env` に次のように書きます。

```env
DATABASE_URL="file:./dev.db"
```

## Userモデル

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  passwords Password[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

1行ずつ見ます。

```prisma
model User {
```

`User` テーブルの構造を定義しています。

```prisma
id String @id @default(uuid())
```

`id` は文字列です。

`@id` は主キーという意味です。

主キーは、そのテーブルの中で1件を特定するための値です。

`@default(uuid())` は、作成時にUUIDを自動生成するという意味です。

```prisma
email String @unique
```

`email` は文字列です。

`@unique` は同じ値を重複登録できないという意味です。

このため、同じメールアドレスのユーザーは作れません。

```prisma
password String
```

ログイン用パスワードです。

実装ではbcryptでハッシュ化された値が入ります。

```prisma
passwords Password[]
```

このユーザーが持っているパスワード一覧です。

`Password[]` は `Password` の配列という意味です。

```prisma
createdAt DateTime @default(now())
```

作成日時です。

`@default(now())` により、作成時の日時が自動で入ります。

```prisma
updatedAt DateTime @updatedAt
```

更新日時です。

`@updatedAt` により、データ更新時に自動で更新されます。

## Passwordモデル

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

```prisma
userId String
```

どのユーザーのパスワードかを保存するためのカラムです。

```prisma
user User @relation(fields: [userId], references: [id])
```

`Password.userId` は `User.id` を参照する、という関係を定義しています。

つまり、Passwordは必ずどこかのUserに紐づきます。

```prisma
serviceName String
```

サービス名です。

```prisma
username String
```

サービスにログインするためのユーザー名です。

```prisma
password String
```

保存対象のパスワードです。

現在の実装ではこの値は平文で保存されます。

本番運用するなら暗号化が必要です。

```prisma
url String?
category String?
memo String?
```

`?` が付いているので、省略可能です。

入力されない場合は `null` になる可能性があります。

## PrismaService

NestJSでは `PrismaService` を作って、アプリ全体でPrismaを使えるようにしています。

```ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }
}
```

```ts
import { PrismaClient } from '@prisma/client'
```

Prisma Clientを読み込んでいます。

Prisma Clientは、DBを操作するためのオブジェクトです。

```ts
export class PrismaService extends PrismaClient
```

`PrismaService` が `PrismaClient` を継承しています。

これにより、`this.prisma.user.findUnique` や `this.prisma.password.create` などが使えます。

```ts
implements OnModuleInit
```

NestJSのモジュール初期化時に処理を実行できるようにしています。

```ts
async onModuleInit() {
  await this.$connect()
}
```

アプリ起動時にDBへ接続します。

`DATABASE_URL` が設定されていないと、ここで起動に失敗します。

## findUnique

ユーザー登録時に使われています。

```ts
const existing = await this.prisma.user.findUnique({ where: { email } })
```

```ts
this.prisma.user
```

`User` テーブルを操作するという意味です。

```ts
findUnique
```

一意な値で1件検索します。

`email` はschemaで `@unique` が付いているため、`findUnique` で検索できます。

```ts
where: { email }
```

検索条件です。

これは省略記法で、次と同じ意味です。

```ts
where: { email: email }
```

## create

ユーザー登録とパスワード登録で使われています。

```ts
const user = await this.prisma.user.create({
  data: { email, password: hashed },
})
```

```ts
this.prisma.user.create
```

`User` テーブルに新しいレコードを作成します。

```ts
data: { email, password: hashed }
```

作成するデータです。

`email` には引数のメールアドレスが入ります。

`password` にはbcryptでハッシュ化した値が入ります。

パスワード登録ではこうです。

```ts
return this.prisma.password.create({
  data: { userId, ...data },
})
```

```ts
this.prisma.password.create
```

`Password` テーブルに新しいレコードを作成します。

```ts
data: { userId, ...data }
```

ログイン中ユーザーのIDと、フロントから送られたフォームデータを保存します。

## findMany

一覧取得で使われています。

```ts
return this.prisma.password.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
})
```

```ts
findMany
```

複数件取得します。

```ts
where: { userId }
```

ログイン中ユーザーのデータだけ取得します。

```ts
orderBy: { createdAt: 'desc' }
```

作成日時の新しい順で並べます。

## findFirst

詳細取得で使われています。

```ts
const password = await this.prisma.password.findFirst({
  where: { id, userId },
})
```

```ts
findFirst
```

条件に合う最初の1件を取得します。

```ts
where: { id, userId }
```

IDとユーザーIDの両方が一致するデータを探します。

これにより、自分のデータだけ取得できます。

## update

編集保存で使われています。

```ts
return this.prisma.password.update({
  where: { id },
  data,
})
```

```ts
update
```

既存レコードを更新します。

```ts
where: { id }
```

更新対象をIDで指定します。

```ts
data
```

更新内容です。

例えば次のようなデータが来た場合、

```ts
{
  serviceName: 'GitHub',
  username: 'new@example.com'
}
```

`serviceName` と `username` が更新されます。

## delete

削除で使われています。

```ts
return this.prisma.password.delete({
  where: { id },
})
```

```ts
delete
```

1件削除します。

```ts
where: { id }
```

削除対象のIDを指定します。

## Prismaの処理をSQLっぽく言い換える

```ts
this.prisma.password.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
})
```

SQLのイメージです。

```sql
SELECT *
FROM Password
WHERE userId = ?
ORDER BY createdAt DESC;
```

```ts
this.prisma.password.create({
  data: { userId, serviceName, username, password }
})
```

SQLのイメージです。

```sql
INSERT INTO Password (userId, serviceName, username, password)
VALUES (?, ?, ?, ?);
```

```ts
this.prisma.password.update({
  where: { id },
  data
})
```

SQLのイメージです。

```sql
UPDATE Password
SET ...
WHERE id = ?;
```

```ts
this.prisma.password.delete({
  where: { id }
})
```

SQLのイメージです。

```sql
DELETE FROM Password
WHERE id = ?;
```

