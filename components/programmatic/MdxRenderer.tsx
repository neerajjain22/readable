import { renderMdx } from "../../lib/mdx/renderMdx"
import { headingToAnchor } from "../../lib/internalLinks"

type MdxRendererProps = {
  source: string
}

export default function MdxRenderer({ source }: MdxRendererProps) {
  return (
    <>
      {renderMdx(source, {
        h2: ({ children }) => {
          const rawText =
            typeof children === "string"
              ? children
              : Array.isArray(children)
                ? children.join(" ")
                : ""
          const id = headingToAnchor(rawText)

          return <h2 id={id}>{children}</h2>
        },
      })}
    </>
  )
}
