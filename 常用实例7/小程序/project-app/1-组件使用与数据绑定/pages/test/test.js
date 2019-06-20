// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    test: "测试",
    btnTest:'按钮文本'
  },
  btnclick:function(){
    console.log('btnclick');
    this.setData({test:"按钮已经被点击"})
  }
})