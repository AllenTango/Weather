const app = getApp()

Page({
  data: {
    todayTips: []
  },
  onLoad: function() {
    // wx.setNavigationBarTitle({
    //   title: '今日小贴士'
    // })
    // wx.setNavigationBarColor({
    //   frontColor: "#ffffff",
    //   backgroundColor: "#161a42",
    // })
    this.setData({
      todayTips: app.globalData.todayTips
    })
  },
})