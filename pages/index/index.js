//index.js

//获取应用实例
const app = getApp();
var Http = require('../../utils/http');

Page({
  /**
   * 数据
   */
  data: {
    /**
     * 待办列表
     */
    todos: [],
    /**
     * 新建输入框的值
     */
    inputVal: '',
    /**
     * 错误信息
     */
    error: '',
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
        }
      }
    })
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
      this.setData({
        error: respMsg
      });
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    app.loadTodoList();
  },

  /**
   * 初始化时
   */
  onLoad: function () {
    app.event.on('event', this.eventListener, this);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (wx.getStorageSync('todoHasChenged')) {
      this.setData({
        todos: wx.getStorageSync('todos')
      });
      wx.setStorageSync('todoHasChenged', false);
    }
  },

  /**
   * 事件监听
   * 
   * @param {*} type 
   * @param {*} data 
   */
  eventListener: function (type, data) {
    if (type === 'error') {
      // 错误提示事件
      this.setData({
        error: data
      });
    } else if (type === 'loadSuccess') {
      // 待办加载成功事件
      this.onShow();
    }
  }
})