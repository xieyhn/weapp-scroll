import type { Pos } from './core'

var Utils = {
  isUndefined(val: unknown): val is undefined {
    return typeof val === 'undefined'
  },
  
  clamp(min: number, max: number, val: number) {
    return Math.max(min, Math.min(max, val))
  },

  clonePos(pos: Pos): Pos {
    return {
      x: pos.x,
      y: pos.y
    }
  }
}

export default Utils