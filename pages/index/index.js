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
     * 左滑按钮组（置顶）
     */
    slideButtons: [{
      type: 'warn',
      text: '置顶'
    }, {
      text: '完成'
    }],
    /**
     * 左滑按钮组（取消置顶）
     */
    slideButtonsTopped: [{
      type: 'warn',
      text: '取消置顶'
    }, {
      text: '完成'
    }],
    /**
     * 左滑按钮组（恢复）
     */
    slideButtonsRecovery: [{
      text: '恢复'
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
    error: '',
    /**
     * 加载中
     */
    isLoading: false,
    /**
     * 筛选条件
     */
    filters: wx.getStorageSync('filters')
  },

  /**
   * 打开筛选面板
   */
  openFilter() {
    var that = this;
    wx.navigateTo({
      url: './filter/filter?containsFinish=' + this.data.filters.containsFinish,
      events: {
        onChange: function (data) {
          var filters = that.data.filters;
          filters = Object.assign({}, data);
          that.setData({
            filters: filters
          });
          wx.setStorageSync('filters', filters);
        }
      }
    })
  },

  /**
   * 置顶/完成/恢复
   */
  slideButtonTap(e) {
    var id = e.currentTarget.dataset.id;

    if (e.detail.index) {
      // 完成
      Http.put("note", {
        id: id,
        status: "FINISH",
        isTopped: 0
      }).then(data => {
        // 拉取最新
        this.pullEvent();
      }).catch(respMsg => {
        this.errorEvent(respMsg);
      });
    } else {
      var note = Util.getById(this.data.todos, id);
      if (note.status === 'FINISH') {
        // 恢复
        Http.put("note", {
          id: id,
          status: 'NORMAL',
          isTopped: 0
        }).then(data => {
          // 拉取最新
          this.pullEvent();
        }).catch(respMsg => {
          this.errorEvent(respMsg);
        });
      } else {
        // 置顶
        Http.put("note", {
          id: id,
          isTopped: note.isTopped ? 0 : 1
        }).then(data => {
          // 拉取最新
          this.pullEvent();
        }).catch(respMsg => {
          this.errorEvent(respMsg);
        });
      }
    }
  },
  /**
   * 编辑待办
   * 
   * @param {*} e 
   */
  edit(e) {
    if (this.data.sliderId) {
      // 有左滑的时候不能编辑
      return;
    }
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
      type: "TODO",
      content: e.detail.value
    }).then(data => {
      // 刷新列表
      this.pullEvent();
      this.setData({
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
    var todo = Util.getById(todos, id);
    this.setData({
      todos: Util.updateById(todos, {
        id: id,
        content: e.detail.value
      })
    });

    // 更新
    Http.put("note", {
      id: id,
      content: e.detail.value
    }).then(data => {
      this.setData({
        editId: 0
      });
    }).catch(respMsg => {
      this.errorEvent(respMsg);
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
      Util.updateById(todos, todo);
      this.setData({
        todos: todos
      });
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
    if (this.data.isLoading) {
      return;
    }
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
    this.setData({
      isLoading: false
    });
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.filters.hasChanged) {
      this.pullEvent();
    }
  },

  /**
   * 拉取事件
   * 
   * @param checkEmpty true：检查todos是不是为空，只有为空才拉取
   */
  pullEvent: function (checkEmpty) {
    if ((checkEmpty && this.data.todos.length) || this.data.isLoading) {
      return;
    }
    this.setData({isLoading: true});

    let that = this;
    Http.get("note?status=" + (this.data.filters.containsFinish ? '' : 'NORMAL'))
      .then(data => {
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