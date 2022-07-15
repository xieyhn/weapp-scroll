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
  },

  isSamePos(p1: Pos, p2: Pos) {
    return p1.x === p2.x && p1.y === p2.y
  }
}

export default Utils