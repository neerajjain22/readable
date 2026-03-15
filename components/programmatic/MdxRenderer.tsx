import { renderMdx } from "../../lib/mdx/renderMdx"
import { headingToAnchor } from "../../lib/internalLinks"
import { sanitizeProgrammaticMdx } from "../../lib/mdx/sanitizeProgrammaticMdx"
import CalloutBox from "../guides/CalloutBox"
import AiQuestionRevealWidget from "./AiQuestionRevealWidget"
import AiBuyerJourneyWidget from "./widgets/AiBuyerJourneyWidget"
import AiCitationDistributionWidget from "./widgets/AiCitationDistributionWidget"
import AiContentPreferenceWidget from "./widgets/AiContentPreferenceWidget"
import AiQueryDistributionWidget from "./widgets/AiQueryDistributionWidget"
import AiQuestionFrequencyWidget from "./widgets/AiQuestionFrequencyWidget"

type MdxRendererProps = {
  source: string
}

export default function MdxRenderer({ source }: MdxRendererProps) {
  const noEmDashSource = source.replace(/—/g, ", ")
  const safeSource = sanitizeProgrammaticMdx(noEmDashSource)

  return (
    <>
      {renderMdx(safeSource, {
        CalloutBox,
        AiQuestionRevealWidget,
        AiCitationDistributionWidget,
        AiQueryDistributionWidget,
        AiContentPreferenceWidget,
        AiBuyerJourneyWidget,
        AiQuestionFrequencyWidget,
        a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
          const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"))
          const { rel: _rel, target: _target, ...rest } = props
          return isExternal ? (
            <a href={href} rel="nofollow noopener" target="_blank" {...rest}>{children}</a>
          ) : (
            <a href={href} {...rest}>{children}</a>
          )
        },
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
