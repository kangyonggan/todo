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
    containsFinish: false
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
    this.data.eventChannel.emit('onChange', {containsFinish: e.detail.value, hasChanged: true});
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      eventChannel: this.getOpenerEventChannel(),
      containsFinish: options.containsFinish === 'true'
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