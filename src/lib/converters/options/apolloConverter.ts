import ts from 'typescript'
import { ConvertedExpression, getInitializerProps } from '../../helper'
import { getMethodExpression } from './methodsConverter'

export const apolloConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  return []
  return getInitializerProps(node)
    .map((prop) => {
      return getMethodExpression(prop, sourceFile)
    })
    .flat()
}
