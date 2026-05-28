# 10. 設定画面とログアウト

この章では、設定画面とログアウト処理を説明します。

対象ファイルは `frontend/src/pages/SettingsPage.tsx` です。

## 設定画面でやっていること

設定画面には主に2つの役割があります。

- アカウント情報を表示する
- ログアウトする

## useNavigate

```ts
const navigate = useNavigate()
```

`useNavigate` は、React Routerで画面遷移するための機能です。

例えば次のように使います。

```ts
navigate('/passwords')
```

これは `/passwords` に移動するという意味です。

## localStorageからemailを読む

```ts
const email = localStorage.getItem('email') ?? 'ユーザー'
```

```ts
localStorage.getItem('email')
```

ブラウザの `localStorage` から `email` を取得しています。

ただし、現在のログイン処理では `email` を `localStorage` に保存していません。

そのため、多くの場合は `null` になります。

```ts
?? 'ユーザー'
```

`localStorage.getItem('email')` が `null` または `undefined` の場合、`'ユーザー'` を使います。

つまり、emailが保存されていなければ画面には `ユーザー` と表示されます。

## ログアウト処理

```ts
const handleLogout = () => {
  if (confirm('ログアウトしますか？')) {
    localStorage.removeItem('token')
    navigate('/')
  }
}
```

1行ずつ見ます。

```ts
const handleLogout = () => {
```

ログアウトボタンを押したときに実行される関数です。

```ts
if (confirm('ログアウトしますか？')) {
```

ブラウザの確認ダイアログを表示します。

OKを押した場合だけ中の処理に進みます。

```ts
localStorage.removeItem('token')
```

保存されているJWTトークンを削除します。

このtokenがなくなると、Axiosは `Authorization` ヘッダーを付けられなくなります。

そのため、パスワード一覧などの認証が必要なAPIにはアクセスできなくなります。

```ts
navigate('/')
```

ログイン画面に移動します。

## なぜtokenを消すとログアウトになるのか

このアプリでは、ログイン状態をサーバー側のセッションではなく、ブラウザに保存したJWTトークンで判断しています。

ログイン中は次のような状態です。

```txt
localStorageにtokenがある
  ↓
AxiosがAuthorizationヘッダーを付ける
  ↓
バックエンドのAuthGuardがtokenを確認する
  ↓
認証OK
```

ログアウト後はこうなります。

```txt
localStorageからtokenを削除する
  ↓
AxiosがAuthorizationヘッダーを付けられない
  ↓
バックエンドのAuthGuardが「トークンがありません」と判断する
  ↓
認証NG
```

## 戻るボタン

```tsx
<button onClick={() => navigate('/passwords')}>← 戻る</button>
```

クリックすると一覧画面に戻ります。

`navigate('/passwords')` は、React Routerによる画面遷移です。

## 改善できる点

現在の設定画面は `email` を表示しようとしていますが、ログイン時・登録時にemailを保存していません。

そのため、常に `ユーザー` と表示されやすいです。

改善するなら、ログイン成功時に次のように保存します。

```ts
localStorage.setItem('email', form.email)
```

また、ログアウト時にはtokenだけでなくemailも削除すると自然です。

```ts
localStorage.removeItem('token')
localStorage.removeItem('email')
```

