import ts from 'typescript';
import { parseComponent } from 'vue-template-compiler';
import { getNodeByKind } from './helper';
import { convertOptionsApi } from './converters/optionsApiConverter';

export const convertSrc = (input: string): string => {
    const parsed = parseComponent(input);
    const { script } = parsed;
    const scriptContent = script?.content || '';

    const sourceFile = ts.createSourceFile('src.tsx', scriptContent, ts.ScriptTarget.Latest);

    const exportAssignNode = getNodeByKind(sourceFile, ts.SyntaxKind.ExportAssignment);
    if (exportAssignNode) {
        // optionsAPI
        /**
         * @see https://github.com/microsoft/TypeScript/issues/36174
         */
        const text = unescape(convertOptionsApi(sourceFile).replace(/\\u/g, '%u'));
        return text;
    }

    throw new Error('no convert target');
};
