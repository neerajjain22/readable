const BLOCK_TAGS = [
  "main",
  "nav",
  "article",
  "section",
  "header",
  "footer",
  "aside",
  "div",
  "span",
]

const tagPattern = new RegExp(`<(\\/?(?:${BLOCK_TAGS.join("|")}))>`, "gi")

export function sanitizeProgrammaticMdx(source: string) {
  return source.replace(tagPattern, (_match, tag) => `&lt;${tag}&gt;`)
}
