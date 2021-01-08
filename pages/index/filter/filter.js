// pages/index/filter/filter.js
var Http = require('../../../utils/http');

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
    oldContainsFinish: false,
    subscribeMessage: false,
    key: ''
  },

  /**
   * 订阅消息
   */
  switchSubscribeMessage (e) {
    var that = this;
    var msgId = 'JySaKT9Nl1cS2K40EsP_fQxIf55R-nRBnz0LrmJ9Tq8';

    if (e.detail.value) {
      wx.requestSubscribeMessage({
        tmplIds: [msgId],
        success: function (e1) {
          that.subscribeMsg(msgId, e1[msgId]);
        }
      });
    } else {
      that.subscribeMsg(msgId, 'reject');
    }
  },

  subscribeMsg(msgId, status) {
    Http.post('note/subscribeMessage', {
      msgId: msgId,
      status: status
    }).then(() => {
      var res = status === 'accept';
      wx.setStorageSync('subMsg', res);
      this.setData({
        subscribeMessage: res
      });
    });
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
      oldContainsFinish: options.containsFinish === 'true',
      subscribeMessage: wx.getStorageSync('subMsg') || false,
      key: options.key || 'filters'
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
      wx.setStorageSync(this.data.key, filters);
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