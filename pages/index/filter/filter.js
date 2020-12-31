// pages/index/filter/filter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventChannel: undefined,
    /**
     * 显示已完成
     */
    containsFinish: false,
    oldContainsFinish: false
  },

  /**
   * 修改是否显示已完成
   * 
   * @param {*} e 
   */
  switchStatus(e) {
    this.setData({
      containsFinish: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      eventChannel: this.getOpenerEventChannel(),
      containsFinish: options.containsFinish === 'true',
      oldContainsFinish: options.containsFinish === 'true'
    });
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
    if (this.data.oldContainsFinish !== this.data.containsFinish) {
      // 有改变，则通知父界面
      var filters = {containsFinish: this.data.containsFinish};
      this.data.eventChannel.emit('onChange', filters);
      wx.setStorageSync('filters', filters);
      getApp().loadTodoList();
    }
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

  }
})