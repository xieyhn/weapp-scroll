Page({
  data: {
    count: 1,
    weappScrollOptions: {
      slidingContainerSelector: '.content'
    }
  },
  onLoad() {
    setTimeout(() => {
      this.setData({
        count: 10,
        // 结构改变后，需要重新触发 scroll.setup 来进行相关初始化
        // 这里目的就是使用 setData 重设置 weappScrollOptions，从而触发 change:_ 监听，重新执行 scroll.setup 方法
        // 可设置下面这行代码，或 'weappScrollOptions.t': Date.now()
        weappScrollOptions: this.data.weappScrollOptions
      })
    }, 0);
  }
})
