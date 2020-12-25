//index.js

//获取应用实例
const app = getApp()
var Util = require('../../utils/util');
var Http = require('../../utils/http');

Page({
  /**
   * 数据
   */
  data: {
    /**
     * 底部工具栏
     */
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
    /**
     * 当前tab
     */
    tabIndex: 0,
    /**
     * 左滑按钮组
     */
    slideButtons: [{
      type: 'warn',
      text: '删除'
    }, {
      text: '完成'
    }],
    /**
     * 待办列表
     */
    todos: [],
    /**
     * 当前编辑的ID
     */
    editId: 0,
    /**
     * 新建输入框的值
     */
    inputVal: '',
    /**
     * 错误信息
     */
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

    if (e.detail.index) {
      // 完成
      Http.put("note", {
        id: id,
        openid: app.openid,
        status: "FINISH"
      }).catch(respMsg => {
        this.errorEvent(respMsg);
      });
    } else {
      // 删除
      Http.delete("note", {
        id: id,
        openid: app.openid
      }).catch(respMsg => {
        this.errorEvent(respMsg);
      });
    }

    // 刷新列表
    this.setData({
      todos: Util.removeById(this.data.todos, id)
    });
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
   * 新建待办事项
   * 
   * @param {*} e 
   */
  addTodo(e) {
    // 内容不能为空
    if (!e.detail.value) {
      return;
    }
    // 收起键盘
    wx.hideKeyboard();

    // 发送请求
    Http.post("note", {
      openid: app.openid,
      type: "TODO",
      content: e.detail.value
    }).then(data => {
      // 插入到第一行
      var todos = this.data.todos;
      todos.unshift(data.note);
      this.setData({
        todos: todos,
        // 清空内容
        inputVal: ''
      });
    }).catch(respMsg => {
      this.errorEvent(respMsg);
    });
  },
  /**
   * 更新待办事项
   * 
   * @param {*} e 
   */
  updateTodo(e) {
    var id = e.currentTarget.dataset.id;
    // 内容不能为空
    if (!e.detail.value) {
      return;
    }
    // 收起键盘
    wx.hideKeyboard();

    var todos = this.data.todos;
    this.setData({
      editId: 0,
      todos: Util.updateById(todos, {
        id: id,
        content: e.detail.value
      })
    });

    // 更新
    Http.put("note", {
      id: id,
      openid: app.openid,
      content: e.detail.value
    }).catch(respMsg => {
      this.errorEvent(respMsg);
    });

  },

  /**
   * 暂存待办
   * 
   * @param {*} e 
   */
  pauseTodo(e) {
    var id = e.currentTarget.dataset.id;

    // 防止误关
    if (this.data.editId === id) {
      this.setData({
        editId: 0
      });
    }

    var todos = this.data.todos;
    var todo = Util.getById(todos, id);
    if (todo.content === e.detail.value) {
      // 本次没有内容改变
      return;
    }

    if (todo.originContent === e.detail.value) {
      // 内容复原
      todo.pause = false;
      todo.content = todo.originContent;
      todo.originContent = '';
    } else {
      // 内容暂存
      if (!todo.pause) {
        // 已暂存的，不必再记录最初内容
        todo.originContent = todo.content;
      }
      todo.pause = true;
      todo.content = e.detail.value;
    }
    this.setData({
      todos: Util.updateById(todos, todo)
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.startLoading();
    this.pullEvent();
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
    app.event.on('pull', this.pullEvent, this);
    app.event.on('error', this.errorEvent, this);
    this.pullEvent();
  },

  /**
   * 拉取事件
   */
  pullEvent: function () {
    let that = this;
    Http.get("note", {
      openid: app.openid
    }).then(data => {
      this.setData({
        // 刷新待办列表
        todos: Util.getByType(data.notes, "TODO")
      });
    }).catch(respMsg => {
      that.errorEvent(respMsg);
    }).finally(function () {
      that.stopLoading();
    });
  },

  /**
   * 异常事件
   * 
   * @param {*} msg 
   */
  errorEvent: function (msg) {
    this.setData({
      error: msg
    });
  }
})