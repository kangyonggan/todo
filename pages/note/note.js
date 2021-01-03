// pages/note/note.js
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

    notes: [],
    loading: false,
    error: '',
    /**
     * 筛选条件
     */
    filters: wx.getStorageSync('note-filters')
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
        this.loadNoteList()
      }).catch(respMsg => {
        this.setData({
          error: respMsg
        });
      });
    } else {
      var note = Util.getById(this.data.notes, id);
      if (note.status === 'FINISH') {
        // 恢复
        Http.put("note", {
          id: id,
          status: 'NORMAL',
          isTopped: 0
        }).then(data => {
          // 拉取最新
          this.loadNoteList()
        }).catch(respMsg => {
          this.setData({
            error: respMsg
          });
        });
      } else {
        // 置顶
        Http.put("note", {
          id: id,
          isTopped: note.isTopped ? 0 : 1
        }).then(data => {
          // 拉取最新
          this.loadNoteList()
        }).catch(respMsg => {
          this.setData({
            error: respMsg
          });
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.data.notes.length) {
      this.loadNoteList();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.loadNoteList();
  },

  /**
   * 打开筛选面板
   */
  openFilter() {
    var that = this;
    wx.navigateTo({
      url: '../index/filter/filter?containsFinish=' + this.data.filters.containsFinish + "&key=note-filters",
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
   * 新建笔记
   */
  newNote() {
    var that = this;
    wx.navigateTo({
      url: './form/form',
      events: {
        onChange: function () {
          that.loadNoteList();
        }
      }
    })
  },

  /**
   * 编辑
   * 
   * @param e
   */
  edit(e) {
    var that = this;

    var id = e.currentTarget.dataset.id;
    var note = Util.getById(this.data.notes, id);
    wx.navigateTo({
      url: './form/form',
      events: {
        onChange: function (data) {
          var arr = data.content.split('\n');
          for (var j = 0; j < arr.length; j++) {
            if (arr[j].trim()) {
              data.title = arr[j];
              break;
            }
          }
          var notes = that.data.notes;
          notes = Util.updateById(notes, data);
          that.setData({
            notes: notes
          });
        }
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('initData', note);
      }
    })
  },

  /**
   * 加载笔记列表
   */
  loadNoteList() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();

    Http.get("note?type=NOTE")
      .then(data => {
        var notes = data.todos;
        for (var i = 0; i < notes.length; i++) {
          var arr = notes[i].content.split('\n');
          for (var j = 0; j < arr.length; j++) {
            if (arr[j].trim()) {
              notes[i].title = arr[j];
              break;
            }
          }
        }

        this.setData({
          notes: notes
        });
      }).catch(respMsg => {
        this.setData({
          error: respMsg
        });
      }).finally(() => {
        this.loading = false;
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      });
  }
})