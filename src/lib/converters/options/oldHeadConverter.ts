import ts from 'typescript'
import {
  ConvertedExpression,
  isVariableAssignment,
  throwErrorOnDestructuring,
} from '../../helper'

export const oldHeadConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  if (ts.isMethodDeclaration(node)) {
    // computed method
    const { name: propName, body, type } = node
    const typeName = type ? `:${type.getText(sourceFile)}` : ''
    const block = body?.getText(sourceFile) || '{}'
    const name = propName.getText(sourceFile)
    throwErrorOnDestructuring(block)

    block.split('\n').forEach((line) => {
      if (isVariableAssignment(line)) {
        throw new Error(
          `Computed property ${name} is assigned to itself. This is not allowed.`
        )
      }
    })

    if (block.includes('this.$emit'))
      throw new Error('Emit not allowed in computed properties.')

    return [
      {
        expression: `const head = computed(()${typeName} => ${block})\nuseHead(head.value))'`,
        returnNames: ['useHead'],
      },
    ]
  }
  return []
}
