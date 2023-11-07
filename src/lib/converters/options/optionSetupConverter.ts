import ts from 'typescript';
import { ConvertedExpression, isVariableAssignment, throwErrorOnDestructuring } from '../../helper';

function removeReturnStatement(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): string {
    const statements = node.body?.statements || [];
    const filteredStatements = statements.filter((statement) => !ts.isReturnStatement(statement));
    const modifiedBodyText = filteredStatements.map((statement) => statement.getText(sourceFile)).join('\n');
    return modifiedBodyText.trim();
}

export const getBodyExpression = (node: ts.Node, sourceFile: ts.SourceFile): ConvertedExpression[] => {
    if (ts.isMethodDeclaration(node) && node.body) {
        let body = node.body?.getText(sourceFile).trim() || '';
        const start = body.indexOf('{');
        const end = body.lastIndexOf('}');
        body.slice(start + 1, end).trim();
        body = removeReturnStatement(node, sourceFile);
        body.split('\n').forEach((line) => {
            if (isVariableAssignment(line)) {
                throw new Error(`property is assigned to itself. This is not allowed.`);
            }
        });
        throwErrorOnDestructuring(body);

        return [
            {
                returnNames: [],
                expression: body
            }
        ];
    }
    return [];
};

export const optionSetupConverter = (node: ts.Node, sourceFile: ts.SourceFile): ConvertedExpression[] => {
    console.log(getBodyExpression(node, sourceFile));
    return getBodyExpression(node, sourceFile);
};
