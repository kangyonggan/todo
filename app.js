//app.js
App({
  // apiUrl: 'http://localhost:8080',
  apiUrl: 'https://kangyonggan.com/api',

  onLaunch: function () {
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      // 登录 获取 code
      wx.login({
        success: res => {
          // 发送 code 到后台换取 openid
          wx.request({
            method: "GET",
            url: this.apiUrl + '/note/getOpenid?code=' + res.code,
            success(res) {
              if (res.data.respCo == '0000') {
                wx.setStorageSync('openid', res.data.data.openid);
              }
            }
          })
        }
      })
    }
  }
})