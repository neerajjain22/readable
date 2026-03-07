import { renderMdx } from "../../lib/mdx/renderMdx"
import { headingToAnchor } from "../../lib/internalLinks"
import { sanitizeProgrammaticMdx } from "../../lib/mdx/sanitizeProgrammaticMdx"
import CalloutBox from "../guides/CalloutBox"

type MdxRendererProps = {
  source: string
}

export default function MdxRenderer({ source }: MdxRendererProps) {
  const safeSource = sanitizeProgrammaticMdx(source)

  return (
    <>
      {renderMdx(safeSource, {
        CalloutBox,
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
