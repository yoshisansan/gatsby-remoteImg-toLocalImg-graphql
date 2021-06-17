## 🚀 概要
  
  
  API（microCMS）から引っ張ってきた画像をローカルフォルダ（正確にはallFileのGraphQLスキーマのchildImageSharp上に）へ設定して gatsby-plugin-image による画像最適化処理を行うために作ったリポジトリです。
  
  
  gatsby-node.js上でAPIを叩いて任意のJSONデータを取得→そのデータを元にonNodeCreateを作成することでローカル上のデータと同じように処理します。
  
  
  
## 🚀 Quick start (Gatsby Cloud)
  

gatsby develop
  
  
