import ts from 'typescript';
import { ConvertedExpression } from '../../helper';

function commentOutNode(node: ts.Node, sourceFile: ts.SourceFile): string {
    const text = node.getFullText(sourceFile);
    const lines = text.split(/\r?\n/g).map((line) => `// ${  line.trim()}`);
    return lines.join('\n');
}

export const otherConverter = (node: ts.Node, sourceFile: ts.SourceFile): ConvertedExpression[] => {
    const commentOut = commentOutNode(node, sourceFile);
    return [
        {
            expression: commentOut
        }
    ];
};
