function isPlainObject(obj: any) {
  // 检查类型
  if (typeof obj !== 'object' || obj === null) return false

  // 检查是否由 constructor 生成
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

export default isPlainObject
