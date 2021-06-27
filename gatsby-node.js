const { createRemoteFileNode } = require("gatsby-source-filesystem")
let crypto = require("crypto")
const fetch = require("node-fetch")
const graphql = require('gatsby');
// const getNoImgURL = require("./src/gatsby-node/getNoImgURL");

// const getNoImgGraphQL = graphql(`
//   query getNoImg {
//     file(
//       childImageSharp: {id: {eq: "3e646b34-f77d-5cb7-8491-02d018e19ebc"}}
//     ) {
//       publicURL
//     }
//   }
// `);
// console.log(getNoImgGraphQL);
//URLにオプション付与
const getUrlOption = (number, url) => {
  const UrlandOption = String(url + `?limit=${number}`)
  return String(UrlandOption)
}
const getMicroCMSdata = async () => {
  const fetchTarget = {
    url: `https://100g.microcms.io/api/v1/100g`,
    option: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.MICROCMS_API_KEY,
      },
    },
  }

  // microCMSのコンテンツを引っ張ろうとするとデフォルトでlimit=10のオプションがついており全てのコンテンツを引っ張ってこれない。totalCountでコンテンツ総数をチェック
  const { url, option } = fetchTarget,
    getTotalCountUrl = getUrlOption(0, url),
    totalCountUrlData = await fetch(getTotalCountUrl, option),
    { totalCount } = await totalCountUrlData.json()

  const getContentUrl = getUrlOption(totalCount, url),
    contentUrlData = await fetch(getContentUrl, option),
    { contents } = await contentUrlData.json()

  return { contents, totalCount }
}

// トップレベルのNodeを作成
exports.sourceNodes = async ({ actions: { createNode }, createNodeId }) => {
  const turnImageObjectIntoGatsbyNode = (contentObj, microContent) => {
    const content = {
      content: microContent.title,
      ["image___NODE"]: createNodeId(`project-image-{${microContent.id}}`),
    }
    const nodeId = createNodeId(`image-{${contentObj.id}}`)
    const nodeContent = JSON.stringify(contentObj)
    const nodeContentDigest = crypto
      .createHash("md5")
      .update(nodeContent)
      .digest("hex")

    const nodeData = {
      ...contentObj,
      ...content,
      id: nodeId,
      microContent,
      internal: {
        type: "Microcms",
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    }

    // nodeとして格納されonCreateNodeのnode変数からも取得できるようになる
    return nodeData
  }

  // 特に変更する必要はないと思ったので参考記事からそのまま転用
  const createImageObjectFromURL = url => {
    const lastIndexOfSlash = url.lastIndexOf("/")
    const id = url.slice(lastIndexOfSlash + 1, url.lastIndexOf("."))
    return { id, image: id, url }
  }

  const microContentData = await getMicroCMSdata()

  // 画像データを持っているコンテンツだけにあえて絞る場合の変数格納
  // const targetMicroContents = microContentData.contents.filter(
  //   ({ thumbnail }) => thumbnail !== undefined
  // );

  microContentData.contents.map(content => {
    let contentObj;
    if(content.thumbnail !== null && content.thumbnail !== undefined){
      contentObj = createImageObjectFromURL(content.thumbnail.url)
    } else {
      // 全く同じURLだと重複分は消えてしまうためcontent.idをオプション付与してURLの重複を避ける
      const NoImageURL = `https://firebasestorage.googleapis.com/v0/b/one-hundred-g.appspot.com/o/forGatsbyNodeJSFile%2FNoImage%2F%20100g-NoImg.png?alt=media&id=${content.id}`;
      contentObj = { id: content.slug, image: content.id, url: NoImageURL }
    }
    const nodeData = turnImageObjectIntoGatsbyNode(contentObj, content)
    createNode(nodeData)
  })
}

// onCreateNodeはsourceNodesの中でcreateNodeしたものを含め全ての生成されたNodeを順番に取得してくれる
exports.onCreateNode = async ({
  node,
  actions,
  store,
  getCache,
  createNodeId,
}) => {
  // onCreateNodeで設定したtypeにあったものだけ処理をする
  if (node.internal.type !== "Microcms") return;

  const { createNode, createNodeField } = actions
  const fileNode = await createRemoteFileNode({
    url: node.url, // string that points to the URL of the image
    parentNodeId: node.id, // id of the parent node of the fileNode you are going to create
    store, // Gatsby's redux store
    getCache, // get Gatsby's cache
    createNode, // helper function in gatsby-node to generate the node
    createNodeId, // helper function in gatsby-node to generate the node id
  })

  // Object配列化
  const microContentArr = Object.entries(node.microContent).map(
    ([key, value]) => [key, value]
  )
  microContentArr.map(async ([key, value]) => {
    await createNodeField({
      node: fileNode,
      name: key,
      value: value,
    })
  })

  // image___NODEをfileNode.idのものと置き換える
  if (fileNode) {
    node.image___NODE = fileNode.id
  }
}

// microCMSを持っていない人の確認用ダミー処理
// 73行付近のconst microContentData = await getMicroCMSdata();と置き換える
// const dammyProjects = {
//  id: 'dammy',
//  title: 'dammyTitle',
//   images : [`https://1.bp.blogspot.com/-eZgH3AYPT0Y/X7zMHMTQO2I/AAAAAAABcYU/Fk3btazNl6oqIHrfcxgJBiUKKSE1tSAIwCNcBGAsYHQ/s400/food_bunka_fry.png`, `https://1.bp.blogspot.com/-uc1fVHdj2RQ/X9GYFTpvwxI/AAAAAAABcs4/Gez9aftyhdc_Hm2kXt5RJm_vK9SuShz8wCNcBGAsYHQ/s400/food_komochi_konnyaku.png`, `https://1.bp.blogspot.com/-g0tbS-Rf0pk/X3hF_S_ScZI/AAAAAAABbmQ/u0Pd0qVobbYOfFYhmls3iBXzIUiuta2-gCNcBGAsYHQ/s400/food_sobagaki.png`]
// }
// const projects = await dammyProjects;
// projects.images.map((image) => {
//   const imgObj = createImageObjectFromURL(image);
//   const nodeData = turnImageObjectIntoGatsbyNode(imgObj, projects);
//   createNode(nodeData);
// });

// microCMSを持っていない人の確認用ダミー処理
// 106行付近の await createNodeField(省略)と置き換える
// await createNodeField(
//   {
//     node: fileNode,
//     name: 'Sample',
//     value: 'true',
//   });

// await createNodeField(
//   {
//     node: fileNode,
//     name: 'Test',
//     value: 'hello test!',
//   });
