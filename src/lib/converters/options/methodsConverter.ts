import ts from 'typescript'
import {
  ConvertedExpression,
  findDescendantArrowFunction,
  getInitializerProps,
  hasWord,
  isVariableAssignment,
  lifecycleNameMap,
  throwErrorOnDestructuring,
} from '../../helper'

export const getMethodExpression = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  if (findDescendantArrowFunction(node))
    throw new Error('Arrow Functions not allowed as root methods.')
  if (ts.isMethodDeclaration(node)) {
    const async = node.modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.AsyncKeyword
    )
      ? 'async'
      : ''

    const name = node.name.getText(sourceFile)
    const type = node.type ? `:${node.type.getText(sourceFile)}` : ''
    const body = node.body?.getFullText(sourceFile) || '{}'
    const parameters = node.parameters
      .map((param) => param.getText(sourceFile))
      .join(',')
    const fn = `${async}(${parameters})${type} =>${body}`

    const pArray = parameters.split(',')

    pArray.forEach((parameter) => {
      if (parameter === '') return
      if (hasWord(parameter, body)) {
        throw new Error(
          `Scope issue in ${name} , ` +
            parameter +
            `parameter conflicts with this.${parameter}. `
        )
      }
    })

    body.split('\n').forEach((line) => {
      if (isVariableAssignment(line)) {
        throw new Error(
          `property ${name} is assigned to itself. This is not allowed.`
        )
      }
    })

    throwErrorOnDestructuring(body)

    if (lifecycleNameMap.has(name)) {
      const newLifecycleName = lifecycleNameMap.get(name)
      const immediate = newLifecycleName == null ? '()' : ''
      return [
        {
          use: newLifecycleName,
          expression: `${newLifecycleName ?? ''}(${fn})${immediate}`,
        },
      ]
    }
    return [
      {
        returnNames: [name],
        expression: `${async} function ${name} (${parameters})${type} ${body}`,
      },
    ]
  }
  return []
}

export const methodsConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  return getInitializerProps(node)
    .map((prop) => {
      return getMethodExpression(prop, sourceFile)
    })
    .flat()
}
