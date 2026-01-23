# FukuReco

福岡ローカルの飲食店・観光地レコメンドサービス

## 開発者へ

スムーズな開発を行うために、開発を始める前に[コーディング規則](./docs/コーディング規則.md)を読んでください！

### LINE Mini App

詳しいドキュメントは[ラインミニアプリ-ドキュメント](./docs/lineMiniApp.md/ラインミニアプリドキュメント.md)にあります。

#### ===フロントエンド===

`miniApp/frontend`ディレクトリで`npm run dev`を行うとミニアプリのフロントエンドが起動できます。(初回起動時やモジュール追加時には、依存関係解消のために`npm ci`を行う必要があります)

> [!NOTE]
> `.env.local`を作成してに`NEXT_PUBLIC_LIFF_ID`を記述しないとLINEとの連携が行えません！<br> LINE Developerのコンソールに、LIFF URLがあります。それの末尾がLIFF IDになっています。

例)
```.env.local
NEXT_PUBLIC_LIFF_ID=20349592-bw0hqto09bgs
```
