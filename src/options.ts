import Utils from './Utils'

export interface Options {
  // 启用X方向滚动
  enableScrollX: boolean
  // 启用Y方向滚动
  enableScrollY: boolean
  // 滑动容器选择器
  slidingContainerSelector: string
  // 阻尼因子，超出边界后添加效果，值越小，阻力越大
  damping: number
  // 动量减速度
  deceleration: number
  // 动量动画默认的持续时间
  momentumDuration: number
  // 加上动量若超出容器后，动量动画持续时间
  momentumOutBoundsDuration: number
  // 回弹时长
  bounceDuration: number
}

var options: Options = {
  enableScrollX: false,
  enableScrollY: false,
  slidingContainerSelector: '.content',
  damping: 0.3,
  deceleration: 0.0015,
  momentumDuration: 1800,
  momentumOutBoundsDuration: 400,
  bounceDuration: 800
}

function setOption<K extends keyof Options>(userOptions: Partial<Options>, key: K) {
  if (!Utils.isUndefined(userOptions[key])) {
    options[key] = userOptions[key]!
  }
}

export function resolveOptions(userOptions: Partial<Options>) {
  setOption(userOptions, 'slidingContainerSelector')
  setOption(userOptions, 'damping')
  setOption(userOptions, 'bounceDuration')
}

export default options
