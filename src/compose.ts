function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return (arg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((prev, curt) => (...args: any) => prev(curt(...args)))
}

export default compose
