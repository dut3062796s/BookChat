const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    book: {},
    menuTree: [],
    token: util.getToken(),
    identify: '',
    wd: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let identify = options.id || options.identify || 'dochub';
    if (!identify || identify == undefined) {
      wx.redirectTo({
        url: '/pages/notfound/notfound',
      })
      return
    }
    this.setData({
      identify: identify,
    })
  },
  onShow: function() {
    this.loadData()
  },
  search: function(e) {
    console.log(e)
  },
  loadData: function() {
    let that = this
    let menu = []
    let book = {}
    let identify = that.data.identify
    if (that.data.book.book_id > 0) {
      return
    }
    util.loading()

    Promise.all([util.request(config.api.bookMenu, {
      identify: identify
    }), util.request(config.api.bookInfo, {
      identify: identify
    })]).then(function([resMenu, resBook]) {
      if (config.debug) console.log(resMenu, resBook)
      if (resMenu.data && resMenu.data.menu) {
        menu = resMenu.data.menu
      }
      if (resBook.data && resBook.data.book) {
        book = resBook.data.book
        book.score_float = Number(book.score / 10).toFixed(1)
        book.percent = Number(book.cnt_readed / book.cnt_doc * 100).toFixed(2)
      }
    }).catch(function(e) {
      console.log(e)
    }).finally(function() {
      if (menu.length == 0) {
        wx.redirectTo({
          url: '/pages/notfound/notfound',
        })
        return
      }
      that.setData({
        menuTree: util.menuToTree(menu),
        book: book,
      })
      wx.hideLoading()
    })
  },
  itemClick: function(e) {
    wx.navigateTo({
      url: '/pages/read/read?identify=' + e.detail.identify,
    })
  },
  search: function(e) {
    util.loading("玩命搜索中...")
    let that = this
    let result = []
    util.request(config.api.searchDoc, {
      identify: that.data.identify,
      wd: e.detail
    }).then(function(res) {
      if (config.debug) console.log(config.api.searchDoc, res)
      if (res.data && res.data.result) {
        result = res.data.result
      }
    }).catch(function(e) {
      console.log(e)
    }).finally(function() {
      that.setData({
        result: result,
        wd: e.detail,
      })
      wx.hideLoading()
      if (result.length == 0) {
        util.toastError("没有搜索到结果")
      }
    })
  }
})