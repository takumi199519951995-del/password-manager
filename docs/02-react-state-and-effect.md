# 02. ReactのuseStateとuseEffect

このアプリのフロントエンドでは、Reactの `useState` と `useEffect` がよく使われています。

初学者にとって一番大事なのは、次のイメージです。

```txt
useState
  画面の中で変わる値を保存する箱

useEffect
  画面が表示された直後など、特定のタイミングで処理を実行する仕組み
```

## useStateとは

`useState` は、画面の状態を保存するためのReactの機能です。

例えば、検索欄に入力された文字を保存する場合はこう書きます。

```ts
const [search, setSearch] = useState('')
```

1行ずつ見ると、こういう意味です。

```ts
const [search, setSearch] = useState('')
```

- `const`
  - JavaScriptで変数を作るための書き方です。
- `[search, setSearch]`
  - `search` は現在の値です。
  - `setSearch` は値を変更するための関数です。
- `useState('')`
  - 初期値を空文字 `''` にしています。

つまり、この1行は次の意味です。

```txt
検索文字を保存する箱を作る。
最初は空文字にする。
値を変えたいときはsetSearchを使う。
```

## 入力欄とuseState

一覧画面では、検索欄がこのように書かれています。

```tsx
<input
  type="text"
  placeholder="検索..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

1行ずつ見ます。

```tsx
type="text"
```

これは普通のテキスト入力欄という意味です。

```tsx
placeholder="検索..."
```

入力欄が空のときに表示される薄い文字です。

```tsx
value={search}
```

入力欄に表示する値を `search` にしています。

`search` は `useState` で作った状態です。

```tsx
onChange={(e) => setSearch(e.target.value)}
```

ユーザーが文字を入力するたびに実行されます。

- `e`
  - 入力イベントの情報です。
- `e.target.value`
  - 入力欄に今入っている文字です。
- `setSearch(e.target.value)`
  - `search` の値を新しい入力内容に更新します。

例えば、ユーザーが `gmail` と入力した場合、流れはこうです。

```txt
ユーザーが g と入力
  ↓
onChangeが動く
  ↓
setSearch('g') が実行される
  ↓
searchが 'g' になる
  ↓
画面が再描画される

ユーザーが m を入力
  ↓
setSearch('gm') が実行される
  ↓
searchが 'gm' になる
  ↓
画面が再描画される
```

## フォームでuseStateを使う例

パスワード登録画面では、フォーム全体を1つのオブジェクトとして管理しています。

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

これは次のような箱を作っているイメージです。

```ts
{
  serviceName: '',
  username: '',
  password: '',
  url: '',
  category: '',
  memo: ''
}
```

サービス名を入力したときはこう更新しています。

```tsx
onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
```

ここは初学者がつまずきやすい場所です。

```ts
{ ...form, serviceName: e.target.value }
```

これは次の意味です。

```txt
今のformの内容を全部コピーする。
そのうえでserviceNameだけ新しい値に差し替える。
```

例えば、今の `form` がこうだったとします。

```ts
{
  serviceName: '',
  username: 'taro',
  password: 'abc123',
  url: '',
  category: '',
  memo: ''
}
```

ユーザーがサービス名に `GitHub` と入力すると、こうなります。

```ts
{
  serviceName: 'GitHub',
  username: 'taro',
  password: 'abc123',
  url: '',
  category: '',
  memo: ''
}
```

`username` や `password` はそのままで、`serviceName` だけ変わります。

## useEffectとは

`useEffect` は、画面表示後に何か処理をしたいときに使います。

パスワード一覧画面では、画面を開いたときに一覧データを取得します。

```ts
useEffect(() => {
  const fetch = async () => {
    try {
      const data = await getPasswords()
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

`useEffect` を開始しています。

中に書いた処理は、画面が表示されたあとに実行されます。

```ts
const fetch = async () => {
```

`fetch` という非同期関数を作っています。

API通信は時間がかかる処理なので、`async` を付けています。

```ts
try {
```

失敗する可能性がある処理を試す場所です。

```ts
const data = await getPasswords()
```

`getPasswords()` を呼んで、バックエンドからパスワード一覧を取得します。

`await` は「結果が返ってくるまで待つ」という意味です。

```ts
setPasswords(data)
```

取得した一覧データを `passwords` state に保存します。

この瞬間、Reactは画面を再描画します。

```ts
} catch {
  navigate('/')
}
```

API通信に失敗した場合はログイン画面 `/` に戻します。

例えば、トークンが無効で `401 Unauthorized` になった場合、この `catch` に入ります。

```ts
fetch()
```

ここで実際に `fetch` 関数を実行しています。

関数を作っただけでは動かないので、最後に呼び出しています。

```ts
}, [navigate])
```

`[navigate]` は依存配列です。

この中に入っている値が変わったとき、`useEffect` がもう一度実行されます。

今回の実装では、基本的には画面表示時に一度実行される理解で問題ありません。

## useStateとuseEffectの違い

```txt
useState
  データを保存する
  入力欄、一覧データ、エラーメッセージなどに使う

useEffect
  タイミングを決めて処理を実行する
  画面を開いた直後にAPIを呼ぶときなどに使う
```

