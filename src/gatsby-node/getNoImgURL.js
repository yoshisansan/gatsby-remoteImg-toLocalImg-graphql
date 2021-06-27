const {graphql, useStaticQuery } = require('gatsby');


exports.getNoImgURL = () => {
  const getNoImgGraphQL = graphql`
      query getNoImg {
        file(
          childImageSharp: {id: {eq: "3e646b34-f77d-5cb7-8491-02d018e19ebc"}}
        ) {
          publicURL
        }
      }
    `
  ;
  const NoImgURL = getNoImgGraphQL.data.file.publicURL;

  return NoImgURL;
}