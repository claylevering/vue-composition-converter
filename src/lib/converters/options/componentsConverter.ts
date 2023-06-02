import ts from 'typescript'
import { ConvertedExpression, getInitializerProps, nonNull } from '../../helper'

export const componentsConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile,
): ConvertedExpression[] => {
  // extract only defineAsyncComponent
  return getInitializerProps(node)
    .map((prop) => {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.text
        const initializer = prop.initializer

        if (ts.isCallExpression(initializer)) {
          const expression = initializer.expression
          const expressionText = expression.getText(sourceFile)

          if (expressionText === 'defineAsyncComponent') {
            const initializerText = initializer.getText(sourceFile)
            return {
              // use: 'defineAsyncComponent',
              use: 'props',
              expression: `const ${name} = ${initializerText}`,
              returnNames: [name],
            }
          }
        }
      }
    })
    .flat()
    .filter(nonNull)
}
