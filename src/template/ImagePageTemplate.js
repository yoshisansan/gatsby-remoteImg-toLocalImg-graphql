import React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const ImagePageTemplate = ({ pageContext }) => {
  return (
    <div>
      <h1>{pageContext.title}</h1>
      <GatsbyImage
        image={getImage(pageContext.gatsbyImg)}
        alt={pageContext.title}
        key={pageContext.title}
      />
    </div>
  )
}

export default ImagePageTemplate;
