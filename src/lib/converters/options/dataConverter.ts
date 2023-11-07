import ts from 'typescript';
import { ConvertedExpression, getNodeByKind } from '../../helper';

function findInterface(sourceFile: ts.SourceFile, interfaceName: string) {
    let result: ts.InterfaceDeclaration | undefined;

    function find(node: ts.Node) {
        if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
            result = node;
        } else {
            ts.forEachChild(node, find);
        }
    }

    find(sourceFile);
    return result;
}

type Types = Record<string, string | undefined>;
export const dataConverter = (node: ts.Node, sourceFile: ts.SourceFile): ConvertedExpression[] => {
    /**
     * data is defined as an interface.
     * so we need to find the interface and get the type of each property.
     *
     * e.g.
     * interface Data {
     *  data1: Type1
     *  data2: Type2
     * }
     *
     * export default defineComponent({
     *  data(): Data {}
     * })
     */
    const dataInterface = findInterface(sourceFile, 'Data');

    const types: Types = {};
    if (dataInterface) {
        dataInterface.members.forEach((member) => {
            if (ts.isPropertySignature(member)) {
                const type = member.type?.getText(sourceFile);
                const name = member.name.getText(sourceFile);
                const isOptional = !!member.questionToken;
                const typeWithOptional = isOptional ? `${type} | undefined` : type;
                types[name] = typeWithOptional;
            }
        });
    }

    const objNode = getNodeByKind(node, ts.SyntaxKind.ObjectLiteralExpression);

    if (!(objNode && ts.isObjectLiteralExpression(objNode))) return [];
    return objNode.properties
        .map((prop) => {
            if (!ts.isPropertyAssignment(prop)) return;
            const name = prop.name.getText(sourceFile);
            const text = prop.initializer.getFullText(sourceFile);
            const refType = types[name] ? `<${types[name]}>` : '';
            return {
                use: 'ref',
                expression: `const ${name} = ref${refType}(${text === 'undefined' ? '' : text})`,
                returnNames: [name]
            };
        })
        .filter((item): item is NonNullable<typeof item> => item != null);
};
