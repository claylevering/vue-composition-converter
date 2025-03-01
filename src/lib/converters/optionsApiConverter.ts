import ts from 'typescript';
import { getExportStatement, getImportStatement } from '../helper';
import convertOptions from './options/optionsConverter';

export default (sourceFile: ts.SourceFile) => {
    const options = convertOptions(sourceFile);
    if (!options) {
        throw new Error('invalid options');
    }

    const { setupProps, propNames, otherProps } = options;

    const newSrc = ts.factory.createSourceFile(
        [
            ...getImportStatement(setupProps),
            ...sourceFile.statements.filter((state) => !ts.isExportAssignment(state)),
            ts.factory.createIdentifier('\n'),
            ...getExportStatement(setupProps, propNames, otherProps)
        ],
        sourceFile.endOfFileToken,
        sourceFile.flags
    );

    const printer = ts.createPrinter({
        removeComments: false
    });
    // print full text
    return printer.printFile(newSrc);
};
