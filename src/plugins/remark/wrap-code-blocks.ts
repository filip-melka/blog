import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'acorn'
import { SKIP, visit } from 'unist-util-visit'
import type { Root } from 'mdast'
import type { VFile } from 'vfile'

const COMPONENT_NAME = 'CodeBlock'
const COMPONENT_ABS_PATH = fileURLToPath(
  new URL('../../components/react/code-block.tsx', import.meta.url),
)

export function remarkWrapCodeBlocks() {
  return function (tree: Root, file: VFile) {
    if (file.extname !== '.mdx') return

    let wrapped = false

    visit(tree, 'code', (node, index, parent) => {
      if (parent == null || index == null) return

      wrapped = true

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: COMPONENT_NAME,
        attributes: [
          { type: 'mdxJsxAttribute', name: 'lang', value: node.lang ?? 'text' },
          { type: 'mdxJsxAttribute', name: 'client:visible', value: null },
        ],
        children: [node],
      } as any

      return SKIP
    })

    if (!wrapped) return

    const importStatement = `import { ${COMPONENT_NAME} } from ${JSON.stringify(
      toImportSpecifier(file.path, COMPONENT_ABS_PATH),
    )};`

    tree.children.unshift({
      type: 'mdxjsEsm',
      value: importStatement,
      data: {
        estree: parse(importStatement, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }),
      },
    } as any)
  }
}

function toImportSpecifier(fromFile: string, toFileAbsPath: string) {
  const relative = path
    .relative(path.dirname(fromFile), toFileAbsPath)
    .split(path.sep)
    .join('/')

  return relative.startsWith('.') ? relative : `./${relative}`
}
