import ts from 'typescript'
import { ConvertedExpression, getInitializerProps } from '../../helper'
import { getMethodExpression } from './methodsConverter'

export const componentsConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  console.log(node)
  return []
  return getInitializerProps(node)
    .map((prop) => {
      return getMethodExpression(prop, sourceFile)
    })
    .flat()
}
