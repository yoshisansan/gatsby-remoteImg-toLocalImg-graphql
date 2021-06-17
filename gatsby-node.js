const { createRemoteFileNode } = require('gatsby-source-filesystem');
let crypto = require("crypto");
const fetch = require("node-fetch");

exports.sourceNodes = async ({ actions, createNodeId }) => {
  const turnImageObjectIntoGatsbyNode = (image, microContent) => {
    const content = {
      content: microContent.title,
      ['image___NODE']: createNodeId(`project-image-{${microContent.id}}`),
    };
    const nodeId = createNodeId(`image-{${image.id}}`);
    const nodeContent = JSON.stringify(image);
    const nodeContentDigest = crypto
          .createHash('md5')
          .update(nodeContent)
          .digest('hex');

    const nodeData = {
      ...image,
      ...content,
      id: nodeId,
      microContent,
      internal: {
        type: 'Image',
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    };

    // nodeとして格納されonCreateNodeのnode変数からも取得できるようになる
    return nodeData;
  };

  const createImageObjectFromURL = (url) => {
    const lastIndexOfSlash = url.lastIndexOf('/');
    const id = url.slice(lastIndexOfSlash + 1, url.lastIndexOf('.'));
    return { id, image: id, url };
  };

  const getUrlOption = (number, url) => {
    const UrlandOption = String(url + `?limit=${number}`)
    return String(UrlandOption);
  }

  const getMicroCMSdata = async() => {
    const fetchTarget = {
      url: `https://100g.microcms.io/api/v1/100g`,
      option: {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY' : process.env.MICROCMS_API_KEY
        }
      }
    }

    // microCMSのコンテンツを引っ張ろうとするとデフォルトでlimit=10のオプションがついており全てのコンテンツを引っ張ってこれない。totalCountでコンテンツ総数をチェック
    const {url, option} = fetchTarget;
    const getTotalCountUrl = getUrlOption(0, url);
    const totalCountUrlData = await fetch(getTotalCountUrl, option);
    const { totalCount } = await totalCountUrlData.json();

    const getContentUrl = getUrlOption(totalCount, url);
    const contentUrlData  = await fetch(getContentUrl, option);
    const { contents } = await contentUrlData.json();

    return { contents, totalCount };
  }
  const microContentData = await getMicroCMSdata();
  // テストなので画像データを持っているコンテンツだけにあえて絞る
  const targetMicroContents =
    microContentData.contents
      .filter(({thumbnail}) => thumbnail !== undefined);

  const { createNode } = actions;

  targetMicroContents.map(content => {
    const imgObj = createImageObjectFromURL(content.thumbnail.url);
    const nodeData = turnImageObjectIntoGatsbyNode(imgObj, content);
    createNode(nodeData);
  });
};

  // microCMSを持っていない人の確認用ダミー処理
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

// onCreateNodeはsourceNodesの中でcreateNodeしたものを含め全ての生成されたNodeを順番に取得してくれる
exports.onCreateNode = async ({
  node, actions, store, getCache, createNodeId
}) => {
  if (node.internal.type === 'Image') {
    const { createNode, createNodeField } = actions;

    const fileNode = await createRemoteFileNode({
       url: node.url, // string that points to the URL of the image
       parentNodeId: node.id, // id of the parent node of the fileNode you are going to create
       store, // Gatsby's redux store
       getCache, // get Gatsby's cache
       createNode, // helper function in gatsby-node to generate the node
       createNodeId, // helper function in gatsby-node to generate the node id
    });

    // Object配列化
    const microContentArr = Object.entries(node.microContent).map( ( [key, value] ) => [key, value]);
    microContentArr.map( async([key, value]) => {
      await createNodeField(
        {
          node: fileNode,
          name: key,
          value: value,
        });
    });
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
    //     value: 'true',
    //   });

    if (fileNode) {
      // link the File node to Image node at field image
      node.image___NODE = fileNode.id;
    }
  }
};


// {
//   id: 'ca1ba919-fd98-53cf-9769-731487ddc946',
//   image: '%20100g-%E7%96%B2%E5%8A%B4',
//   url: 'https://images.microcms-assets.io/assets/8fdf35cd24bb4480b5f5f00ecf473e4b/8e800d7086b446ec8b8dc2731b181fb9/%20100g-%E7%96%B2%E5%8A%B4.png',
//   content: '疲労回復に良いとされる栄養素は何をどのくらい取れば良い？全食材の中から多い順に並べ替え',
//   image___NODE: '9d388a99-c326-549a-a4a6-60d33bcdd21d',
//   parent: null,
//   children: [],
//   internal: {
//     type: 'Image',
//     content: '{"id":"%20100g-%E7%96%B2%E5%8A%B4","image":"%20100g-%E7%96%B2%E5%8A%B4","url":"https://images.microcms-assets.io/assets/8fdf35cd24bb4480b5f5f00ecf473e4
// b/8e800d7086b446ec8b8dc2731b181fb9/%20100g-%E7%96%B2%E5%8A%B4.png"}',
//     contentDigest: 'a25bd9d5b367fce42000823df5ab9cea',
//     owner: 'default-site-plugin',
//     counter: 81
//   }
// }