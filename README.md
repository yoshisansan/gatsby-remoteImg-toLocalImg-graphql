## 🚀 概要

API（microCMS）から引っ張ってきた画像をローカルフォルダ（正確には allFile の GraphQL スキーマの childImageSharp 上に）へ設定して gatsby-plugin-image による画像最適化処理を行うために作ったリポジトリです。

gatsby-node.js 上で API を叩いて任意の JSON データを取得 →sourceNodes でトップレベルの Node 作成 → 作成したトップレベルの Node を onNodeCreate で呼び出し gatsby-plugin-image の createRemoteFileNode で ImageSharp 化に対応することでローカル上のデータと同じように画像最適化処理をできるようにしています。

詳細記事：準備中

## 🚀 始め方

gatsby develop
