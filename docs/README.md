# Password Manager 実装解説ドキュメント

この `docs` ディレクトリは、このアプリケーションの処理の流れを初学者向けに説明するための資料です。

このアプリは、ユーザーがログインしたあとに、自分のパスワード情報を登録・一覧表示・詳細表示・編集・削除できるパスワード管理アプリです。

## 全体構成

```txt
frontend
  React + Vite
  画面を表示する
  入力フォームを管理する
  AxiosでバックエンドAPIを呼ぶ

backend
  NestJS
  APIリクエストを受け取る
  JWTトークンを確認する
  Prismaを使ってDBを操作する

database
  SQLite
  UserテーブルとPasswordテーブルにデータを保存する
```

## 最初に読む順番

1. [全体の処理フロー](./01-overview.md)
2. [ReactのuseStateとuseEffect](./02-react-state-and-effect.md)
3. [AxiosとAPI通信](./03-axios-api.md)
4. [ログインと新規登録](./04-auth-flow.md)
5. [パスワード一覧取得](./05-password-list.md)
6. [パスワード新規登録](./06-password-create.md)
7. [詳細表示・コピー・削除](./07-password-detail-delete.md)
8. [パスワード編集・更新](./08-password-update.md)
9. [PrismaとDB操作](./09-prisma-database.md)
10. [設定画面とログアウト](./10-settings-logout.md)

## 重要な注意点

現在の実装では、ユーザー自身のログインパスワードはbcryptでハッシュ化されています。

一方で、登録したサービス用パスワードは `Password` テーブルの `password` カラムにそのまま保存されています。学習用の実装としては流れを理解しやすいですが、本番のパスワード管理アプリとして使う場合は、保存前に暗号化する必要があります。

