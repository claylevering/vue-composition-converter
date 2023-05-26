import ts from 'typescript'
import {
  ConvertedExpression,
  findDescendantArrowFunction,
  getInitializerProps,
  isVariableAssignment,
  nonNull,
  throwErrorOnDestructuring,
} from '../../helper'

export const computedConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  return getInitializerProps(node)
    .map((prop) => {
      if (findDescendantArrowFunction(prop))
        throw new Error('Arrow Functions not allowed as computed properties.')
      if (ts.isMethodDeclaration(prop)) {
        // computed method
        const { name: propName, body, type } = prop
        const typeName = type ? `:${type.getText(sourceFile)}` : ''
        const block = body?.getText(sourceFile) || '{}'
        const name = propName.getText(sourceFile)
        throwErrorOnDestructuring(block)

        /**
         * const listPage = listPage.value; みたいなところでエラーになるため
         * ビルド時のエラーで代用
         */
        // block.split('\n').forEach((line) => {
        //   if (isVariableAssignment(line)) {
        //     throw new Error(
        //       `Computed property ${name} is assigned to itself. This is not allowed.`
        //     )
        //   }
        // })

        if (block.includes('this.$emit'))
          throw new Error('Emit not allowed in computed properties.')

        return {
          use: 'computed',
          expression: `const ${name} = computed(()${typeName} => ${block})`,
          returnNames: [name],
        }
      }
    })
    .flat()
    .filter(nonNull)
}
