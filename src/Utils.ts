var Utils = {
  isUndefined(val: unknown): val is undefined {
    return typeof val === 'undefined'
  },
  
  clamp(min: number, max: number, val: number) {
    return Math.max(min, Math.min(max, val))
  },
}

export default Utils