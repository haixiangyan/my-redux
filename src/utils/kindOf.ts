function isDate(value: any) {
  if (value instanceof Date) return true
  return (
    typeof value.toDateString === 'function' &&
    typeof value.getDate === 'function' &&
    typeof value.setDate === 'function'
  )
}

function isError(value: any) {
  if (value instanceof Error) return true
  return (
    typeof value.message === 'string' &&
    value.constructor &&
    typeof value.constructor.stackTraceLimit === 'number'
  )
}

function getCtorName(value: any): string | null {
  return typeof value.constructor === 'function' ? value.constructor.name : null
}

function kindOf(value: any): string {
  if (value === void 0) return 'undefined'
  if (value === null) return 'null'

  const type = typeof value
  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function':
      return type
  }

  if (Array.isArray(value)) return 'array'
  if (isDate(value)) return 'date'
  if (isError(value)) return 'error'

  const ctorName = getCtorName(value)
  switch (ctorName) {
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return ctorName
  }

  return type
}

export default kindOf
