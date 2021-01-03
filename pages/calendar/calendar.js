// pages/note/note.js
// 引入插件安装器
import plugin from '../../components/calendar/plugins/index'
// 设置代办
import todo from '../../components/calendar/plugins/todo'
// 农历相关功能
import solarLunar from '../../components/calendar/plugins/solarLunar/index'
// 节假日
import holidays from '../../components/calendar/plugins/holidays/index'

plugin
  .use(todo)
  .use(solarLunar)
  .use(holidays);

const app = getApp()
var Http = require('../../utils/http');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * 新建输入框的值
     */
    inputVal: '',
    inputTips: '',
    calendarConfig: {
      theme: 'elegant',
      showLunar: true,
      emphasisWeek: true,
      showHolidays: true,
      showFestival: true,
      highlightToday: false,
      firstDayOfWeek: 'Mon',
      takeoverTap: true,
    },
    calendar: undefined,
    todos: [],
    error: '',
    todays: []
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
    var day = this.data.calendar.getSelectedDates()[0];

    // 发送请求
    Http.post("note", {
      type: "TODO",
      content: e.detail.value,
      day: day.year + '-' + (day.month < 10 ? '0' + day.month : day.month) + '-' 
      + (day.date < 10 ? '0' + day.date : day.date)
    }).then(data => {
      // 刷新列表
      app.loadTodoList();
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
   * 日历初次渲染完成后触发事件，如设置事件标记
   */
  afterCalendarRender(e) {
    this.setData({
      calendar: this.selectComponent('#calendar').calendar
    });
    app.event.on('event', this.eventListener, this);

    this.setData({
      todos: wx.getStorageSync('todos')
    });
    var day = new Date();
    this.initDay(day.getFullYear(), day.getMonth() + 1, day.getDate());
  },

  /**
   * 初始化待办
   */
  initTodos(day) {
    var dates = [];
    var todays = [];
    for (let index = 0; index < this.data.todos.length; index++) {
      var todo = this.data.todos[index];
      if (day && todo.day === day) {
        todays.push(todo);
      }
      if (todo.day) {
        var arr = todo.day.split('-');
        dates.push({
          year: arr[0],
          month: arr[1],
          date: arr[2]
        });
      }
    }
    this.data.calendar.setTodos({
      dates: dates
    })
    if (day) {
      this.setData({
        todays: todays
      });
    }
  },

  /**
   * 日期点击事件（此事件会完全接管点击事件），需自定义配置 takeoverTap 值为真才能生效
   * currentSelect 当前点击的日期
   */
  takeoverTap(e) {
    this.initDay(e.detail.year, e.detail.month, e.detail.date);
  },

  /**
   * 初始化日期
   * 
   * @param {*} year 
   * @param {*} month 
   * @param {*} date 
   */
  initDay(year, month, date) {
    this.data.calendar.cancelSelectedDates();
    this.data.calendar.setSelectedDates([{
      year: year,
      month: month,
      date: date
    }])
    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;
    this.initTodos(year + '-' + month + '-' + date);
    this.setData({
      inputTips: '添加' + year + '年' + month + '月' + date + '日' + '的待办事项'
    });
  },

  /**
   * 当改变月份时触发
   * => current 当前年月 / next 切换后的年月
   */
  whenChangeMonth(e) {
    this.initTodos()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    app.loadTodoList();
  },

  /** 
   * 切换到当前tab 
   * 显示时 
   */
  onTabItemTap() {
    if (wx.getStorageSync('todoHasChenged') && this.data.calendar) {
      this.setData({
        todos: wx.getStorageSync('todos')
      });
      var day = this.data.calendar.getSelectedDates()[0];
      this.initDay(day.year, day.month, day.date);
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
      this.setData({
        todos: wx.getStorageSync('todos')
      });
      var day = this.data.calendar.getSelectedDates()[0];
      this.initDay(day.year, day.month, day.date);
    }
  }
})