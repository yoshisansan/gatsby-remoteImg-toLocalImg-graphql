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
      parent: null,
      children: [],
      internal: {
        type: 'Image',
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    };
    return nodeData;
  };

  const createImageObjectFromURL = (url) => {
    const lastIndexOfSlash = url.lastIndexOf('/');
    const id = url.slice(lastIndexOfSlash + 1, url.lastIndexOf('.'));
    return { id, image: id, url };
  };

  const { createNode } = actions;
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

  targetMicroContents.map(content => {
    const imgObj = createImageObjectFromURL(content.thumbnail.url);
    const nodeData = turnImageObjectIntoGatsbyNode(imgObj, content);
    createNode(nodeData);
  });
};

exports.onCreateNode = async ({
  node, actions, store, getCache, createNodeId
}) => {
  if (node.internal.type === 'Image') {
    const { createNode } = actions;

    const fileNode = await createRemoteFileNode({
       url: node.url, // string that points to the URL of the image
       parentNodeId: node.id, // id of the parent node of the fileNode you are going to create
       store, // Gatsby's redux store
       getCache, // get Gatsby's cache
       createNode, // helper function in gatsby-node to generate the node
       createNodeId, // helper function in gatsby-node to generate the node id
    });

    if (fileNode) {
      // link the File node to Image node at field image
      node.image___NODE = fileNode.id;
    }
  }
 };