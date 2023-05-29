import ts from 'typescript'
import { ConvertedExpression, getNodeByKind } from '../../helper'

interface TypeInfo {
  name: string
  optional: boolean
  type: string | undefined
}

let types: Record<string, TypeInfo> = {}

function getData(node: ts.Node) {
  if (ts.isInterfaceDeclaration(node) && node?.name?.text === 'Data') {
    for (const property of node.members) {
      if (ts.isPropertySignature(property)) {
        // @ts-expect-error
        const name = property.name.text
        const optional = property.questionToken ? true : false
        let type: string | undefined
        if (property.type) {
          if (ts.isArrayTypeNode(property.type)) {
            console.log(property.type.elementType)
            // @ts-expect-error
            if (
              property.type.elementType?.type &&
              ts.isUnionTypeNode(property.type.elementType.type)
            ) {
              type =
                '(' +
                // @ts-expect-error
                property.type.elementType.type.types
                  // @ts-expect-error
                  .map((t) => t.typeName.text)
                  .join(' | ') +
                ')[]'
            } else {
              // @ts-expect-error
              type = property.type.elementType.typeName.text + '[]'
            }
          } else if (ts.isTupleTypeNode(property.type)) {
            type =
              '[' +
              // @ts-expect-error
              property.type.elements.map((el) => el.typeName.text).join(', ') +
              ']'
          } else if (ts.isTypeReferenceNode(property.type)) {
            // @ts-expect-error
            type = property.type.typeName.text
          } else {
            // プリミティブ型
            // TODO foo?: string のような場合、`const foo = ref<any>()` になってしまう
            type = undefined
          }
        } else {
          type = 'any'
        }
        types[name] = { name, optional, type }
      }
    }
  }
  ts.forEachChild(node, getData)
}

export const dataConverter = (
  node: ts.Node,
  sourceFile: ts.SourceFile
): ConvertedExpression[] => {
  const objNode = getNodeByKind(node, ts.SyntaxKind.ObjectLiteralExpression)
  types = {}
  getData(sourceFile)
  // console.log(types)

  if (!(objNode && ts.isObjectLiteralExpression(objNode))) return []
  return objNode.properties
    .map((prop) => {
      if (!ts.isPropertyAssignment(prop)) return
      const name = prop.name.getText(sourceFile)
      const text = prop.initializer.getFullText(sourceFile)
      let refType = ''
      if (types[name] && types[name].type) {
        refType = types[name].optional
          ? `<${types[name].type} | undefined>`
          : `<${types[name].type}>`
      }
      return {
        use: 'ref',
        expression: `const ${name} = ref${refType}(${
          text === 'undefined' ? '' : text
        })`,
        returnNames: [name],
      }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
}
