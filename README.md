## 🚀 概要
  
  
  API（microCMS）から引っ張ってきた画像をローカルフォルダ（正確にはallFileのGraphQLスキーマのchildImageSharp上に）へ設定して gatsby-plugin-image による画像最適化処理を行うために作ったリポジトリです。
  
  
  gatsby-node.js上でAPIを叩いて任意のJSONデータを取得→sourceNodesでトップレベルのNode作成→作成したトップレベルのNodeをonNodeCreateで呼び出し gatsby-plugin-image の createRemoteFileNode でImageSharp化に対応することでローカル上のデータと同じように画像最適化処理をできるようにしています。
  
  
  詳細記事：準備中
  
  
## 🚀 始め方
  
  
gatsby develop
  
  
