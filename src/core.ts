import Easing, { EasingFunction } from './Easing'
import Utils from './Utils'
import options, { resolveOptions,  Options } from './options'

type Rect = WechatMiniprogram.BoundingClientRectCallbackResult

export interface Pos {
  x: number
  y: number
}

interface ScrollCallback {
  (data: {
    x: number
    y: number
    maxScrollDistanceX: number
    maxScrollDistanceY: number
  }): void
}

var ownerInstance: ComponentDescriptor
/**
* 最外层容器 BoundingClientRect
*/
var containerRect: Rect
/**
* 滑动容器实例，通过此实例设置 CSS 属性
*/
var slidingContainerInstance: ComponentDescriptor
/**
* 滑动容器 BoundingClientRect
*/
var slidingContainerRect: Rect
/**
* 标记 X 方向是否能滚动
*/
var canScrollX = false
/**
* 标记 Y 方向是否能滚动
*/
var canScrollY = false
/**
* X方向的最小、最大滚动距离。如 -200 至 0（手势往右时，元素左移，translateX 为负值）
*/
var minTranslateX: number
var maxTranslateX = 0
/**
* Y方向的最小，最大滚动距离。如 -200 至 0（手势往下时，元素上移，translateY 为负值）
*/
var minTranslateY: number
var maxTranslateY = 0
/**
* 滑动元素的位置信息，即滑动元素上的 CSS translate 值
* 触摸动作需要以此为基础进行变换
*/
var pos: Pos = { x: 0, y: 0 }
/**
* 记录触摸开始时，手指的位置
*/
var startTouch = { clientX: 0, clientY: 0 }
/**
* 记录每次触摸开啥时，滑动容器位置
*/
var startPos: Pos = { x: 0, y: 0 }
/**
* 记录触摸开始时的时间戳
*/
var startTimeStamp = 0
/**
* 记录触摸开始前需要清除的 effect
*/
var effect: (() => void) | null = null

/**
 * callbacks
 */
var onScrollCallbacks: ScrollCallback[] = []

/**
 * 设置样式
 */
 function setTranslate(pos0: Pos) {
  if (Utils.isSamePos(pos0, pos)) return
  
  slidingContainerInstance.setStyle({
    transform: 'translateX(' + pos0.x + 'px) translateY(' + pos0.y + 'px)'
  })
  pos.x = pos0.x
  pos.y = pos0.y
  onScrollCallbacks.forEach(cb => cb({
    x: pos.x,
    y: pos.y,
    maxScrollDistanceX: minTranslateX * -1,
    maxScrollDistanceY: minTranslateY * -1
  }))
}

/**
 * @param fromPos
 * @param toPos 
 * @param duration 持续时长，单位ms
 * @param timing
 * @param onComplete 动画完成的回调
 */
 function moveFromTo(
  fromPos: Pos,
  toPos: Pos,
  duration: number,
  timing: {
    x: EasingFunction,
    y: EasingFunction
  },
  onComplete?: () => void
) {
  var aborted = false
  var completed = false
  fromPos = Utils.clonePos(fromPos)
  toPos = Utils.clonePos(toPos)

  if (duration === 0) {
    setTranslate(toPos)
    ownerInstance.requestAnimationFrame(function() {
      completed = true
      onComplete && onComplete()
    })
  } else {
    var startTime = Date.now()
    var disX = toPos.x - fromPos.x
    var disY = toPos.y - fromPos.y
    var progressX = 1
    var progressY = 1
    var rAFHandler = function rAFHandler() {
      if (aborted) return
      var curPos = Utils.clonePos(fromPos)
      if (canScrollX) {
        progressX = timing.x(Utils.clamp(0, 1, (Date.now() - startTime) / duration))
        curPos.x = disX * progressX + fromPos.x
      }
      if (canScrollY) {
        progressY = timing.y(Utils.clamp(0, 1, (Date.now() - startTime) / duration))
        curPos.y = disY * progressY + fromPos.y
      }
      setTranslate(curPos)
      
      if (progressX < 1 || progressY < 1) {
        ownerInstance.requestAnimationFrame(rAFHandler)
      } else {
        completed = true
        onComplete && onComplete()
      }
    }
    ownerInstance.requestAnimationFrame(rAFHandler)
  }

  if (effect) effect()
  effect = function abort() {
    if (!completed && !aborted) {
      aborted = true
    }
  }
}

/**
 * 超出边界后就行位置修正，即回弹效果
 */
 function positionCorrection(pos: Pos) {
  var correctedPos: Pos = {
    x: Utils.clamp(minTranslateX, maxTranslateX, pos.x),
    y: Utils.clamp(minTranslateY, maxTranslateY, pos.y)
  }
  if (!Utils.isSamePos(correctedPos, pos)) {
    moveFromTo(pos, correctedPos, options.bounceDuration, { x: Easing.v3, y: Easing.v3 })
  }
}

export function setup(_options: Options, _: any, _ownerInstance: ComponentDescriptor, instance: ComponentDescriptor) {
  resolveOptions(_options)

  ownerInstance = _ownerInstance
  containerRect = instance.getBoundingClientRect()
  slidingContainerInstance = ownerInstance.selectComponent(options.slidingContainerSelector)!
  slidingContainerRect = slidingContainerInstance.getBoundingClientRect()

  if (slidingContainerRect.width > containerRect.width) {
    // canScrollX
    canScrollX = Utils.isUndefined(_options.enableScrollX) ? true : _options.enableScrollX
    minTranslateX = (slidingContainerRect.width - containerRect.width) * -1
  }
  if (slidingContainerRect.height > containerRect.height) {
    // canScrollY
    canScrollY = Utils.isUndefined(_options.enableScrollY) ? true : _options.enableScrollY
    minTranslateY = (slidingContainerRect.height - containerRect.height) * -1
  }
}

// touchstart
export function touchstart(event: WechatMiniprogram.TouchEvent) {
  startTouch.clientX = event.changedTouches[0].clientX
  startTouch.clientY = event.changedTouches[0].clientY

  startPos.x = pos.x
  startPos.y = pos.y

  startTimeStamp = event.timeStamp

  if (effect) {
    effect()
    effect = null
  }
}

// touchmove
export function touchmove(event: WechatMiniprogram.TouchEvent) {
  var deltaX = event.changedTouches[0].clientX - startTouch.clientX
  var deltaY = event.changedTouches[0].clientY - startTouch.clientY

  var x = startPos.x
  var y = startPos.y

  if (canScrollX) {
    x += deltaX

    if (x > maxTranslateX) {
      // 手指右滑导致元素左侧超出，超出部分添加阻尼行为
      x = maxTranslateX + options.damping * (x - maxTranslateX)
    } else if (x < minTranslateX) {
      // 手指左滑导致元素右侧超出，超出部分添加阻尼行为
      x = minTranslateX + options.damping * (x - minTranslateX)
    }
  }

  if (canScrollY) {
    y += deltaY

    if (y > maxTranslateY) {
      // 手指下滑导致元素顶部超出，超出部分添加阻尼行为
      y = maxTranslateY + options.damping * (y - maxTranslateY)
    } else if (y < minTranslateY) {
      // 手指上滑导致元素底部超出，超出部分添加阻尼行为
      y = minTranslateY + options.damping * (y - minTranslateY)
    }
  }

  setTranslate({ x, y })
}

// touchend
export function touchend(event: WechatMiniprogram.TouchEvent) {
  var minMovingDistance = 15
  var maxMovingDuration = 300
  var finalPos: Pos = { x: pos.x, y: pos.y }
  
  // 未移动
  if (Utils.isSamePos(finalPos, startPos)) return

  var eventDuration = event.timeStamp - startTimeStamp

  if (eventDuration > maxMovingDuration) {
    positionCorrection(finalPos)
    return
  }

  // 移动距离
  var distanceX = Math.abs(finalPos.x - startPos.x)
  var distanceY = Math.abs(finalPos.y - startPos.y)

  // 动量动画持续时间
  var durationX = 0
  var durationY = 0

  // 动量动画函数
  var timingX = Easing.v1
  var timingY = Easing.v1

  var calculateMomentum = function calculateMomentum(start: number, end: number, distance: number) {
    var speed = distance / eventDuration
    var dir = end - start > 0 ? 1 : -1
    var duration = Math.min(options.momentumDuration, (speed * 2) / options.deceleration)
    var delta = Math.pow(speed, 2) / options.deceleration * dir

    return {
      duration: duration,
      delta: delta
    }
  }

  if (
    canScrollX 
    && distanceX > minMovingDistance
    && finalPos.x <= maxTranslateX
    && finalPos.x >= minTranslateX
  ) {
    var result = calculateMomentum(startPos.x, pos.x, distanceX)

    durationX = result.duration
    finalPos.x += result.delta

    if (finalPos.x > maxTranslateX || finalPos.x < minTranslateX) {
      durationX = options.momentumOutBoundsDuration
      timingX = Easing.v2
      var beyondDis = containerRect.width / 6
      if (finalPos.x > maxTranslateX) {
        finalPos.x = maxTranslateX + beyondDis
      } else {
        finalPos.x = minTranslateX + beyondDis * -1
      }
    }
  }

  if (
    canScrollY 
    && distanceY > minMovingDistance
    && finalPos.y >= minTranslateY
    && finalPos.y <= maxTranslateY
  ) {
    // 在边界中，可以进行动量动画
    var result = calculateMomentum(startPos.y, pos.y, distanceY)

    durationY = result.duration
    finalPos.y += result.delta

    if (finalPos.y > maxTranslateY || finalPos.y < minTranslateY) {
      durationY = options.momentumOutBoundsDuration
      timingY = Easing.v2
      var beyondDis = containerRect.height / 6
      if (finalPos.y > maxTranslateY) {
        finalPos.y = maxTranslateY + beyondDis
      } else {
        finalPos.y = minTranslateY + beyondDis * -1
      }
    }
  }

  moveFromTo(pos, finalPos, Math.max(durationX, durationY), { x: timingX, y: timingY }, function() {
    positionCorrection(finalPos)
  })
}

export function onScroll(callback: ScrollCallback) {
  onScrollCallbacks.push(callback)

  return function cancel() {
    var idx = onScrollCallbacks.indexOf(callback)
    if (idx !== 1) {
      onScrollCallbacks.splice(idx, 1)
    }
  }
}
