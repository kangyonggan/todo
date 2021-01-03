// pages/note/form/form.js
var Http = require('../../../utils/http');

Page({

  /**
   * 富文本编辑器
   */
  editorCtx: undefined,

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    note: {}
  },

  onEditorReady() {
    var that = this;
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;
      that.editorCtx.insertText({
        text: that.data.note.content
      });
    }).exec();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    // 监听initData事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('initData', function (data) {
      that.setData({
        note: data
      });
    })
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

  /**
   * 提交
   */
  submit: function () {
    // 收起键盘
    wx.hideKeyboard();

    var that = this;

    if (this.data.loading) {
      return;
    }
    this.setData({
      loading: true
    });
    this.editorCtx.getContents({
      success: function (res) {
        var note = that.data.note;
        note.content = res.text;
        that.setData({
          note: note
        });
        // 发送请求
        Http.request(that.data.note.id ? 'PUT' : 'POST', "note", {
          id: that.data.note.id,
          type: 'NOTE',
          content: res.text
        }).then(data => {
          // 返回列表
          that.getOpenerEventChannel().emit('onChange', note);
          wx.navigateBack();
        }).catch(respMsg => {
          that.setData({
            error: respMsg
          });
        }).finally(() => {
          that.setData({
            loading: false
          });
        });
      }
    })
  }
})