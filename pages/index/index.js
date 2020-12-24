//index.js
//获取应用实例
const app = getApp()

Page({
  /**
   * 数据
   */
  data: {
    tabbars: [{
        "text": "待办",
        "iconPath": "../../../images/todo.png",
        "selectedIconPath": "../../../images/todo-selected.png"
      },
      {
        "text": "笔记",
        "iconPath": "../../../images/note.png",
        "selectedIconPath": "../../../images/note-selected.png"
      },
      {
        "text": "日程",
        "iconPath": "../../../images/calendar.png",
        "selectedIconPath": "../../../images/calendar-selected.png"
      },
      {
        "text": "关于",
        "iconPath": "../../../images/about.png",
        "selectedIconPath": "../../../images/about-selected.png"
      }
    ],
    tabIndex: 0,
    slideButtons: [{
      type: 'warn',
      text: '删除'
    }, {
      text: '完成'
    }],
    todoList: [],
    editId: 0,
    isLoading: false,
    error: '',
    inputVal: ''
  },
  /**
   * 切换底部导航
   */
  tabChange(e) {
    this.setData({
      tabIndex: e.detail.index
    });
  },
  /**
   * 删除/完成
   */
  slideButtonTap(e) {
    let that = this;
    if (that.data.isLoading) {
      return;
    }
    that.startLoading();
    wx.request({
      method: !!e.detail.index ? "PUT" : "DELETE",
      url: app.apiUrl + "/note",
      data: {
        id: e.currentTarget.dataset.id,
        openid: wx.getStorageSync('openid'),
        status: 'FINISH'
      },
      success: function (res) {
        that.stopLoading();
        if (res.data.respCo == '0000') {
          var todoList = that.data.todoList;
          var index = -1;
          for (var i = 0; i < todoList.length; i++) {
            if (todoList[i].id === e.currentTarget.dataset.id) {
              index = i;
              break;
            }
          }
          todoList.splice(index, 1);
          that.setData({
            todoList: todoList
          });
        } else {
          that.setData({
            error: "网络错误，请稍后重试！"
          });
        }
      },
      fail: function (err) {
        that.stopLoading();
        that.setData({
          error: "网络错误，请稍后重试！"
        });
      }
    })
  },
  /**
   * 编辑待办
   * 
   * @param {*} e 
   */
  edit(e) {
    this.setData({
      editId: e.currentTarget.dataset.id
    });
  },
  /**
   * 新建/编辑待办事项
   * 
   * @param {*} e 
   */
  addTodo(e) {
    if (!e.detail.value) {
      return;
    }
    // 收起键盘
    wx.hideKeyboard();
    let that = this;
    if (that.data.isLoading) {
      return;
    }
    that.startLoading();
    wx.request({
      method: e.currentTarget.dataset.id ? "PUT" : "POST",
      url: app.apiUrl + "/note",
      data: {
        id: e.currentTarget.dataset.id,
        openid: wx.getStorageSync('openid'),
        type: 'TODO',
        content: e.detail.value
      },
      success: function (res) {
        that.stopLoading();
        if (res.data.respCo == '0000') {
          that.setData({
            inputVal: '',
            editId: 0
          });
          if (res.data.data.note) {
            var todoList = that.data.todoList;
            todoList.unshift(res.data.data.note);
            that.setData({
              todoList: todoList
            });
          } else {
            var todoList = that.data.todoList;
            for (var i = 0; i < todoList.length; i++) {
              if (todoList[i].id === e.currentTarget.dataset.id) {
                todoList[i].content = e.detail.value;
                break;
              }
            }
            that.setData({
              todoList: todoList
            });
          }
        } else {
          that.setData({
            error: "网络错误，请稍后重试！"
          });
        }
      },
      fail: function (err) {
        that.stopLoading();
        that.setData({
          error: "网络错误，请稍后重试！"
        });
      }
    })
  },
  /**
   * 开始加载
   */
  startLoading() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    this.setData({
      isLoading: true
    });
  },
  /**
   * 停止加载中
   */
  stopLoading() {
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
    this.setData({
      isLoading: false
    });
  },
  /**
   * 刷新todo列表
   */
  refresh() {
    if (this.data.isLoading) {
      wx.stopPullDownRefresh();
      return;
    }
    this.startLoading();
    let that = this;
    wx.request({
      method: "GET",
      url: app.apiUrl + "/note?openid=" + wx.getStorageSync('openid'),
      success: function (res) {
        that.stopLoading();
        if (res.data.respCo == '0000') {
          var todoList = [];
          for (var i = 0; i < res.data.data.notes.length; i++) {
            if (res.data.data.notes[i].type === 'TODO') {
              todoList.push(res.data.data.notes[i]);
            }
          }
          that.setData({
            todoList: todoList,
            inputVal: '',
            editId: 0
          });
        } else {
          that.setData({
            error: "网络错误，请稍后重试！"
          });
        }
      },
      fail: function (err) {
        that.stopLoading();
        that.setData({
          error: "网络错误，请稍后重试！"
        });
      }
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.refresh();
  },

  /**
   * 初始化
   */
  onLoad: function () {
    this.refresh();
  }
})