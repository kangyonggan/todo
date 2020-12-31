// components/todo-list/todo-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    todos: {
      type: Array,
      value: []
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
    }
  }
})