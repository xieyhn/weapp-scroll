export type EasingFunction = (t: number) => number

var Easing = {
  v1: function (t: number) {
    return 1 + --t * t * t * t * t
  },
  v2: function(t: number) {
    return t * (2 - t)
  },
  v3: function(t: number) {
    return 1 - --t * t * t * t
  }
}

export default Easing
