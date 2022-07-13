declare interface ComponentDescriptor {

  selectComponent(sel: string): ComponentDescriptor | undefined

  selectAllComponents(sels: string[]): ComponentDescriptor[]

  setStyle(style: WechatMiniprogram.IAnyObject | string): void

  addClass(className: string): void

  removeClass(className: string): void

  hasClass(className: string): void

  requestAnimationFrame(cb: Function): void

  getBoundingClientRect(): WechatMiniprogram.BoundingClientRectCallbackResult
}
