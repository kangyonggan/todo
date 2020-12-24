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
    todoList: wx.getStorageSync("todos") || [],
    editId: 0,
    inputVal: '',
    error: ''
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
    var id = e.currentTarget.dataset.id;
    console.log('删除/完成', id);
    var operType = e.detail.index ? "UPDATE" : "DELETE";

    var todoList = this.data.todoList;
    // 删除当前元素
    var index = -1;
    for (var i = 0; i < todoList.length; i++) {
      if (todoList[i].id === id) {
        index = i;
        break;
      }
    }
    todoList.splice(index, 1);
    this.setData({
      todoList: todoList
    });

    // 同步到后台
    app.send(operType, {
      id: id,
      openid: wx.getStorageSync('openid'),
      status: 'FINISH'
    });
  },
  /**
   * 编辑待办
   * 
   * @param {*} e 
   */
  edit(e) {
    console.log('edit', e.currentTarget.dataset.id);
    this.setData({
      editId: e.currentTarget.dataset.id
    });
  },
  /**
   * 新建待办事项
   * 
   * @param {*} e 
   */
  addTodo(e) {
    if (!e.detail.value) {
      return;
    }
    // 收起键盘
    wx.hideKeyboard();

    // 同步到后台
    app.send("SAVE", {
      openid: wx.getStorageSync('openid'),
      type: "TODO",
      content: e.detail.value
    });

    this.setData({
      inputVal: ''
    });
    

    app.send("SYNC");
  },
  /**
   * 更新待办事项
   * 
   * @param {*} e 
   */
  updateTodo(e) {
    var id = e.currentTarget.dataset.id;
    console.log('update', e.detail.value);
    if (!e.detail.value) {
      return;
    }
    // 收起键盘
    wx.hideKeyboard();

    var todoList = this.data.todoList;
    // 更新当前元素
    for (var i = 0; i < todoList.length; i++) {
      if (todoList[i].id === id) {
        todoList[i].content = e.detail.value;
        break;
      }
    }
    this.setData({
      editId: 0,
      todoList: todoList
    });

    // 同步到后台
    app.send("UPDATE", {
      id: id,
      openid: wx.getStorageSync('openid'),
      content: e.detail.value
    });

  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.startLoading();
    app.send("SYNC");
  },

  /**
   * 开始加载
   */
  startLoading() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
  },

  /**
   * 停止加载中
   */
  stopLoading() {
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },

  /**
   * 初始化
   */
  onLoad: function () {
    app.event.on('sync', this.syncEvent, this);
    app.event.on('error', this.errorEvent, this);
  },

  /**
   * 同步事件
   * 
   * @param {*} todos 
   */
  syncEvent: function (todos) {
    console.log('syncEvent', todos.length);
    this.setData({
      todoList: todos
    });
    this.stopLoading();
  },

  /**
   * 异常事件
   * 
   * @param {*} msg 
   */
  errorEvent: function (msg) {
    console.log('errorEvent', msg);
    this.setData({
      error: msg
    });
  }
})