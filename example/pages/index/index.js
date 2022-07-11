Page({
  data: {
    scrollOptions: {
      slidingContainerSelector: '.content',
    }
  },
  toVertical() {
    wx.navigateTo({
      url: '/pages/vertical/index'
    })
  },
  toDynamic() {
    wx.navigateTo({
      url: '/pages/dynamic/index'
    })
  },
  toMultiple() {
    wx.navigateTo({
      url: '/pages/multiple/index'
    })
  }
})
