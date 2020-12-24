//app.js
// event.js

class Event {

  on(event, fn, ctx) {
    if (typeof fn != "function") {
      console.error('fn must be a function')
      return
    }

    this._stores = this._stores || {}

    ;
    (this._stores[event] = this._stores[event] || []).push({
      cb: fn,
      ctx: ctx
    })
  }

  emit(event) {
    this._stores = this._stores || {}
    var store = this._stores[event],
      args

    if (store) {
      store = store.slice(0)
      args = [].slice.call(arguments, 1)
      for (var i = 0, len = store.length; i < len; i++) {
        store[i].cb.apply(store[i].ctx, args)
      }
    }
  }

  off(event, fn) {
    this._stores = this._stores || {}

    // all
    if (!arguments.length) {
      this._stores = {}
      return
    }

    // specific event
    var store = this._stores[event]
    if (!store) return

    // remove all handlers
    if (arguments.length === 1) {
      delete this._stores[event]
      return
    }

    // remove specific handler
    var cb
    for (var i = 0, len = store.length; i < len; i++) {
      cb = store[i].cb
      if (cb === fn) {
        store.splice(i, 1)
        break
      }
    }
    return
  }
}

App({
  // apiUrl: 'http://localhost:8080',
  // socketUrl: 'ws://localhost:8080/note',
  apiUrl: 'https://kangyonggan.com/api',
  socketUrl: 'wss://kangyonggan.com/api/note',

  socket: null,
  event: new Event(),

  onLaunch: function () {
    var openid = wx.getStorageSync('openid');
    if (openid) {
      this.connetSocket(openid);
      return;
    }
    let that = this;
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
                that.connetSocket(res.data.data.openid);
              }
            }
          })
        }
      })
    }
  },
  /**
   * 连接服务器
   * 
   * @param {*} openid 
   */
  connetSocket: function (openid) {
    console.log('connect server', openid);
    this.socket = wx.connectSocket({
      url: this.socketUrl + '/' + openid,
      success: function () {
        console.log('connect success');
      },
      fail: function () {
        console.log('connect fail');
      }
    });
    var that = this;
    this.socket.onMessage(function (e) {
      var notes = JSON.parse(e.data);
      console.log('receive message', notes.length);
      var todos = [];
      for (var i = 0; i < notes.length; i++) {
        if (notes[i].type === "TODO") {
          todos.push(notes[i]);
        }
      }
      wx.setStorageSync('notes', notes);
      wx.setStorageSync('todos', todos);
      that.event.emit('sync', todos);
    });
    this.socket.onClose(function (code, reason) {
      console.log('closed', code, reason);
      this.connetSocket(wx.getStorageSync('openid'));
    });
    this.socket.onError(function (errMsg) {
      console.log('onError', errMsg);
    });
  },
  /**
   * 发送消息到服务器
   * 
   * @param {*} operType 
   * @param {*} note 
   */
  send: function (operType, note) {
    console.log('send', operType, note);
    this.socket.send({
      data: JSON.stringify({
        operType: operType,
        note: note
      })
    });
  }
})