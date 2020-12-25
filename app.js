//app.js

var Event = require('./utils/event');
var Http = require('./utils/http');

App({
  event: Event.newEvent(),
  openid: '',

  onLaunch: function () {
    var openid = wx.getStorageSync('openid');
    this.openid = openid;
    if (!openid) {
      // 登录 获取 code
      wx.login({
        success: res => {
          // 发送 code 到后台换取 openid
          Http.get('note/getOpenid?code=' + res.code).then(data => {
            wx.setStorageSync('openid', data.openid);
            this.openid = data.openid;
            this.event.emit('pull');
          }).catch(respMsg => {
            this.event.emit('error', respMsg);
          });
        }
      })
    }
  }
})