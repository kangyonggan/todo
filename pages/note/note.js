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
var Util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
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
     * 当前编辑的ID
     */
    editId: 0,
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
    isLoading: false,
    todos: [],
    error: '',
    todays: []
  },

    /**
   * 置顶/完成/恢复
   */
  slideButtonTap(e) {
    var id = e.currentTarget.dataset.id;
    var day = this.data.calendar.getSelectedDates()[0];
    day = day.year + '-' + day.month + '-' + day.date;

    if (e.detail.index) {
      // 完成
      Http.put("note", {
        id: id,
        status: "FINISH",
        isTopped: 0
      }).then(data => {
        // 拉取最新
        this.pullEvent(day);
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
          this.pullEvent(day);
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
          this.pullEvent(day);
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
    var day = this.data.calendar.getSelectedDates()[0];
    var dayStr = day.year + '-' + day.month + '-' + day.date;

    // 发送请求
    Http.post("note", {
      type: "TODO",
      content: e.detail.value,
      day: day.year + '-' + (day.month < 10 ? '0' + day.month : day.month) + '-' + day.date
    }).then(data => {
      // 刷新列表
      this.pullEvent(dayStr);
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

    var todays = this.data.todays;
    var todo = Util.getById(todays, id);
    this.setData({
      todays: Util.updateById(todays, {
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
      Util.updateById(todays, todo);
      this.setData({
        todays: todays
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

    var todays = this.data.todays;
    var todo = Util.getById(todays, id);
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
      todays: Util.updateById(todays, todo)
    });
  },

  /**
   * 日历初次渲染完成后触发事件，如设置事件标记
   */
  afterCalendarRender(e) {
    this.setData({
      calendar: this.selectComponent('#calendar').calendar
    });
    this.pullEvent();
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
  onLoad: function (options) {},

  /**
   * 切换到当前tab
   */
  onTabItemTap() {
    if (this.data.calendar) {
      var day = this.data.calendar.getSelectedDates()[0];
      this.pullEvent(day.year + '-' + day.month + '-' + day.date);
    }
  },

  /**
   * 拉取事件
   */
  pullEvent: function (date) {
    if (this.data.isLoading) {
      return;
    }
    this.setData({
      isLoading: true
    });

    let that = this;
    Http.get("note?type=TODO")
      .then(data => {
        this.setData({
          // 刷新待办列表
          todos: data.todos,
          todays: []
        });

        if (date) {
          var arr = date.split('-');
          this.initDay(arr[0], arr[1], arr[2]);
        } else {
          var today = new Date();
          this.initDay(today.getFullYear(), + (today.getMonth() + 1), + today.getDate());
        }
      }).catch(respMsg => {
        that.errorEvent(respMsg);
      }).finally(function () {
        that.stopLoading();
      });
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