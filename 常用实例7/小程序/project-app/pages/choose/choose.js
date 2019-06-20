// pages/choose/choose.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  btnCloose:function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(res)
      }
    })
  },
  btnRreview: function () {
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: ['http://www.pptok.com/wp-content/uploads/2012/08/xunguang-4.jpg','http://www.pptbz.com/pptpic/UploadFiles_6909/201203/2012031220134655.jpg'] // 需要预览的图片http链接列表
    })
  },
  btnGetinfo: function () {
    wx.getImageInfo({
      src: 'images/a.jpg',
      success(res) {
        console.log(res)
        console.log(res.width)
        console.log(res.height)
      }
    })
  },
})