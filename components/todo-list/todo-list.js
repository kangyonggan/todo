// components/todo-list/todo-list.js
var app = getApp();
var Util = require('../../utils/util');
var Http = require('../../utils/http');

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    todos: {
      type: Array,
      value: []
    },
    showFinish: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    /**
     * 当前编辑的ID
     */
    editId: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
     * 长按复制
     */
    copy: function (e) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.content,
        success: function () {
          wx.showToast({
            title: '复制成功',
          });
        }
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

      var todos = this.properties.todos;
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

      var todos = this.properties.todos;
      var todo = Util.getById(todos, id);

      // 更新
      Http.put("note", {
        id: id,
        content: e.detail.value
      }).then(data => {
        todo.pause = false;
        this.setData({
          editId: 0,
          todos: Util.updateById(todos, todo)
        });
        app.loadTodoList();
      }).catch(respMsg => {
        app.event.emit('event', 'error', respMsg);
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

    editDay(e) {
    },

    bindDateChange(e) {
      console.log(e);
      var id = e.currentTarget.dataset.id;
      var todos = this.properties.todos;
      var todo = Util.getById(todos, id);

      // 更新
      Http.put("note", {
        id: id,
        day: e.detail.value
      }).then(data => {
        this.setData({
          todos: Util.updateById(todos, todo)
        });
        app.loadTodoList();
      }).catch(respMsg => {
        app.event.emit('event', 'error', respMsg);
      });
    },

    /**
     * 置顶/完成/恢复
     */
    slideButtonTap(e) {
      var id = e.currentTarget.dataset.id;
      var note = Util.getById(this.properties.todos, id);

      if (note.status === 'NORMAL') {
        if (e.detail.index) {
          // 完成
          Http.put("note", {
            id: id,
            status: "FINISH",
            isTopped: 0
          }).then(data => {
            // 拉取最新
            app.loadTodoList();
          }).catch(respMsg => {
            app.event.emit('event', 'error', respMsg);
          });
        } else {
          // 置顶/取消置顶
          Http.put("note", {
            id: id,
            isTopped: note.isTopped ? 0 : 1
          }).then(data => {
            // 拉取最新
            app.loadTodoList();
          }).catch(respMsg => {
            app.event.emit('event', 'error', respMsg);
          });
        }
      } else {
        if (e.detail.index) {
          // 恢复
          Http.put("note", {
            id: id,
            status: "NORMAL"
          }).then(data => {
            // 拉取最新
            app.loadTodoList();
          }).catch(respMsg => {
            app.event.emit('event', 'error', respMsg);
          });
        } else {
          // 删除
          Http.delete("note", {
            id: id
          }).then(data => {
            // 拉取最新
            app.loadTodoList();
          }).catch(respMsg => {
            app.event.emit('event', 'error', respMsg);
          });
        }
      }
    }
  }
})