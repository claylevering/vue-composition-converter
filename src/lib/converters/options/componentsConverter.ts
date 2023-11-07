import ts from 'typescript';
import { ConvertedExpression, getInitializerProps, nonNull } from '../../helper';

export const componentsConverter = (node: ts.Node, sourceFile: ts.SourceFile): ConvertedExpression[] =>
    // extract only defineAsyncComponent
    getInitializerProps(node)
        .map((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const name = prop.name.text;
                const { initializer } = prop;

                if (ts.isCallExpression(initializer)) {
                    const { expression } = initializer;
                    const expressionText = expression.getText(sourceFile);

                    if (expressionText === 'defineAsyncComponent') {
                        const initializerText = initializer.getText(sourceFile);
                        return {
                            // use: 'defineAsyncComponent',
                            use: 'props',
                            expression: `const ${name} = ${initializerText}`,
                            returnNames: [name]
                        };
                    }
                }
            }
        })
        .flat()
        .filter(nonNull);
