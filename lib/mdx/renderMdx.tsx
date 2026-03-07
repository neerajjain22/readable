import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import type { MDXComponents } from "mdx/types"

export function renderMdx(source: string, components?: MDXComponents) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
      components={components}
    />
  )
}
