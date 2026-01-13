import type { Code, Root } from "mdast"
import { visit } from "unist-util-visit"
import type { MdxJsxFlowElement } from "mdast-util-mdx"
import { insertImports, type Imports } from "./utils"

type HandlerProps = {
  imports: Imports
  node: Code
  parent: MdxJsxFlowElement
  index: number
}

function handleCodeBlock({ imports, node, parent, index }: HandlerProps) {
  const language = (node as Code).lang || "plaintext"

  if (language.toLocaleLowerCase() === "math") return

  if (!imports["code"]) {
    imports["code"] = {
      fullStatement: `import {CodeBlock} from '@components/react/code-block'`,
      importSpecifier: "CodeBlock",
      source: "@components/react/code-block",
    }
  }

  parent.children[index] = {
    type: "mdxJsxFlowElement",
    name: "CodeBlock",
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "language",
        value: language,
      },

      {
        type: "mdxJsxAttribute",
        name: "client:visible",
      },
    ],
    children: [node],
  }
}

export default function customElements() {
  return (tree: Root) => {
    const imports: Imports = {}
    visit(tree, (node, index: any, parent: any) => {
      if (node.type === "code") {
        handleCodeBlock({ imports, node, parent, index })
      }
    })
    insertImports({ tree, imports })
  }
}
