import React from "react"
import { StaticImage, GatsbyImage, getImage } from "gatsby-plugin-image"
import { graphql } from "gatsby"

const Home = ({ data }) => {
  const GatsbyImages = data.allFile.edges.map(({ node }) => {
    return (
      <GatsbyImage
        image={getImage(node.childImageSharp)}
        alt={node.name}
        key={node.name}
      />
    )
  })

  return (
    <div>
      <h1>Hello world!</h1>
      {GatsbyImages}
      {/* <StaticImage
        src="../images/shiva.jpeg"
        width={600}
        alt="Shiva"
        placeholder="blurred"
        quality="40"
      /> */}
    </div>
  )
}

export const query = graphql`
  query MyQuery {
    allFile {
      edges {
        node {
          name
          childImageSharp {
            gatsbyImageData(
              blurredOptions: { width: 100 }
              width: 600
              placeholder: BLURRED
            )
          }
        }
      }
    }
  }
`

export default Home
