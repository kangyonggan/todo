//app.js

var Event = require('./utils/event');
var Http = require('./utils/http');

App({
  event: Event.newEvent(),
  loading: false,

  onLaunch: function () {
    var openid = wx.getStorageSync('openid');

    if (!openid) {
      // 登录 获取 code
      wx.login({
        success: res => {
          // 发送 code 到后台换取 openid
          Http.get('note/getOpenid?code=' + res.code).then(data => {
            wx.setStorageSync('openid', data.openid);

            this.loadTodoList();
          }).catch(respMsg => {
            this.event.emit('event', 'error', respMsg);
          });
        }
      })
    } else {
      this.loadTodoList();
    }
  },

  /**
   * 加载待办列表
   */
  loadTodoList() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();

    Http.get("note?type=TODO")
      .then(data => {
        for (var i = 0; i < data.todos.length; i++) {
          var todo = data.todos[i];

          var buttons = [];
          if (todo.status === 'NORMAL') {
            if (todo.isTopped) {
              buttons = [{
                type: 'warn',
                text: '取消置顶'
              }, {
                text: '完成'
              }];
            } else {
              buttons = [{
                type: 'warn',
                text: '置顶'
              }, {
                text: '完成'
              }];
            }
          } else {
            buttons = [{
              type: 'warn',
              text: '删除'
            }, {
              text: '恢复'
            }];
          }
          todo.buttons = buttons;
        }

        wx.setStorageSync('todos', data.todos);
        wx.setStorageSync('todoHasChenged', true);
        // 通知index待办加载成功了
        this.event.emit('event', 'loadSuccess');
      }).catch(respMsg => {
        console.log(respMsg);
        this.event.emit('event', 'error', respMsg);
      }).finally(() => {
        this.loading = false;
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      });
  }
})