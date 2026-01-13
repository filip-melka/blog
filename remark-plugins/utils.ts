import type { Root } from "mdast"

export type Imports = {
  [key: string]: {
    fullStatement: string
    importSpecifier: string
    source: string
  }
}

type ImportsHandlerProps = {
  tree: Root
  imports: Imports
}

export function insertImports({ tree, imports }: ImportsHandlerProps) {
  if (Object.keys(imports).length === 0) return

  tree.children.unshift({
    type: "mdxjsEsm",
    value: Object.values(imports)
      .map(({ fullStatement }) => fullStatement)
      .join("\n"),
    data: {
      estree: {
        type: "Program",
        body: Object.values(imports).map(({ importSpecifier, source }) => {
          return {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportSpecifier",
                local: {
                  type: "Identifier",
                  name: importSpecifier,
                },
                imported: {
                  type: "Identifier",
                  name: importSpecifier,
                },
              },
            ],
            source: {
              type: "Literal",
              value: source,
            },
            attributes: [],
          }
        }),
        sourceType: "module",
      },
    },
  })
}
