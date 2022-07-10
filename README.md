# mp-scroll
+ 目前支持横向滚动

## 使用方式

1. 使用 wxs 标签引入

```html
<wxs src="./scroll.wxs" module="scroll" />

<view 
  change:_="{{ scroll.setup }}" 
  _="{{ { slidingContainerSelector: '.menu-scroll__inner' } }}"
  bind:touchstart="{{ scroll.touchstart }}"
  bind:touchmove="{{ scroll.touchmove }}"
  bind:touchend="{{ scroll.touchend }}"
  bind:touchcancel="{{ scroll.touchend }}"
>
  <view class="menu-scroll__inner">
    <!-- ... -->
  </view>
</view>
```