import ts from 'typescript'
import {
  ConvertedExpression,
  getNodeByKind,
  lifecycleNameMap,
  objToString,
} from '../../helper'
import { computedConverter } from './computedConverter'
import { dataConverter } from './dataConverter'
import { lifecycleConverter } from './lifecycleConverter'
import { methodsConverter } from './methodsConverter'
import { watchConverter } from './watchConverter'
import { propReader } from './propsReader'
import { oldHeadConverter } from './oldHeadConverter'
import { componentsConverter } from './componentsConverter'
import { otherConverter } from './otherConverter'
import { optionSetupConverter } from './optionSetupConverter'

export const convertOptions = (sourceFile: ts.SourceFile) => {
  const exportAssignNode = getNodeByKind(
    sourceFile,
    ts.SyntaxKind.ExportAssignment,
  )
  if (exportAssignNode) {
    const objectNode = getNodeByKind(
      exportAssignNode,
      ts.SyntaxKind.ObjectLiteralExpression,
    )
    if (objectNode && ts.isObjectLiteralExpression(objectNode)) {
      return _convertOptions(objectNode, sourceFile)
    }
  }
  return null
}

const _convertOptions = (
  exportObject: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
) => {
  const otherProps: ConvertedExpression[] = []
  const dataProps: ConvertedExpression[] = []
  const computedProps: ConvertedExpression[] = []
  const methodsProps: ConvertedExpression[] = []
  const watchProps: ConvertedExpression[] = []
  const lifecycleProps: ConvertedExpression[] = []
  const componentsProps: ConvertedExpression[] = []
  const oldHeadProps: ConvertedExpression[] = []
  const optionSetupProps: ConvertedExpression[] = []

  const propNames: string[] = []
  const propDefaults: Record<string, string | undefined> = {}
  const propTypes: Record<string, string> = {}

  exportObject.properties.forEach((prop) => {
    const name = prop.name?.getText(sourceFile) || ''
    switch (true) {
      case name === 'oldHead':
        oldHeadProps.push(...oldHeadConverter(prop, sourceFile))
        break
      case name === 'setup':
        optionSetupProps.push(...optionSetupConverter(prop, sourceFile))
        break
      case name === 'components':
        componentsProps.push(...componentsConverter(prop, sourceFile))
        break
      case name === 'data':
        dataProps.push(...dataConverter(prop, sourceFile))
        break
      case name === 'computed':
        computedProps.push(...computedConverter(prop, sourceFile))
        break
      case name === 'watch':
        watchProps.push(...watchConverter(prop, sourceFile))
        break
      case name === 'methods':
        methodsProps.push(...methodsConverter(prop, sourceFile))
        break
      case lifecycleNameMap.has(name):
        lifecycleProps.push(...lifecycleConverter(prop, sourceFile))
        break

      case name === 'props':
        const propsProperty = prop as ts.PropertyAssignment
        const props = propsProperty.initializer as ts.ObjectLiteralExpression

        props.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop)) {
            const propObject = prop.initializer as ts.ObjectLiteralExpression
            console.log(propObject)
            const typeProperty = propObject.properties.find(
              (p) =>
                ts.isPropertyAssignment(p) &&
                p.name.getText(sourceFile) === 'type',
            ) as ts.PropertyAssignment
            const defaultProperty = propObject.properties.find(
              (p) =>
                ts.isPropertyAssignment(p) &&
                p.name.getText(sourceFile) === 'default',
            ) as ts.PropertyAssignment
            const requiredProperty = propObject.properties.find(
              (p) =>
                ts.isPropertyAssignment(p) &&
                p.name.getText(sourceFile) === 'required',
            ) as ts.PropertyAssignment

            const propRequired =
              requiredProperty?.initializer.getText(sourceFile) || 'false'
            const propName =
              propRequired === 'true'
                ? `${prop.name.getText(sourceFile)}`
                : `${prop.name.getText(sourceFile)}?`
            const propDefault = defaultProperty?.initializer.getText(sourceFile)
            console.log(propRequired)
            if (ts.isAsExpression(typeProperty.initializer)) {
              const typeArg = typeProperty.initializer.type
              // Remove "PropType<" and ">" from the type string
              const propType = typeArg
                .getText(sourceFile)
                .replace('PropType<', '')
                .slice(0, -1)

              propTypes[propName] = propType
              propDefaults[propName] = propDefault || undefined
            } else {
              const propType = typeProperty.initializer.getText(sourceFile)
              propTypes[propName] = propType
            }
          }
        })
        propNames.push(...propReader(prop, sourceFile))
        break
      case name === 'name':
        break

      default:
        // comment out other properties
        otherProps.push(...otherConverter(prop, sourceFile))
        break
    }
  })

  const propsRefProps: ConvertedExpression[] =
    propNames.length === 0
      ? []
      : [
          {
            use: 'props',
            expression: `interface Props ${objToString(propTypes)}`,
            returnNames: propNames,
            pkg: 'ignore',
          },
          Object.keys(propDefaults).length === 0
            ? {
                use: 'props',
                expression: `const props = defineProps<Props>()`,
                returnNames: ['props'],
                pkg: 'ignore',
              }
            : {
                use: 'props',
                expression: `const props = withDefaults(defineProps<Props>(), ${objToString(
                  propDefaults,
                )}`,
                returnNames: ['props'],
                pkg: 'ignore',
              },
        ]

  const useNuxtAppProps: ConvertedExpression = {
    use: 'props',
    expression: `const nuxtApp = useNuxtApp()`,
    returnNames: ['nuxtApp'],
    pkg: 'ignore',
  }

  const setupProps: ConvertedExpression[] = [
    ...propsRefProps,
    ...componentsProps,
    useNuxtAppProps,
    ...dataProps,
    ...optionSetupProps,
    ...computedProps,
    ...methodsProps,
    ...oldHeadProps,
    ...watchProps,
    ...lifecycleProps,
  ]

  return {
    setupProps,
    propNames,
    otherProps,
  }
}
