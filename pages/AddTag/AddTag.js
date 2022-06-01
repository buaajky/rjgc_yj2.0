// pages/AddTag/AddTag.js
const utils = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    server_hostname: utils.server_hostname,
    server_imagename: utils.server_imagename,
    
    tags: [
      // {
      //   content: "咱就是说",
      // },
      // {
      //   name: "绝绝子",
      // },
      // {
      //   name: "一整个美住了",
      // },
      // {
      //   name: "浅拍一下",
      // },
      // {
      //   name: "好看到翘jiojio",
      // },
      // {
      //   name: "是谁心动了",
      // },
      // {
      //   name: "北京市",
      // }
    ],

    bottomTags: [],
    city: "",
    inputText: "",
    matchedNumber: 0,

    scrollTop: undefined,
    // sidebarData: ["常用标签", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    //               "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    // indexText: "",
  },

  addExistingTag: function(e) {
    var that = this
    console.log('addExistingTag')
    var tagName = e.currentTarget.dataset.name
    var tags = that.data.tags
    var bottomTags = that.data.bottomTags
    for (let i in tags) {
      if (tags[i].content == tagName) {
        if (tags[i].selected) {
          var city = that.data.city
          if (city == tagName) {
            wx.showToast({
              title: '此标签无法移除',
              icon: 'error',
              duration: 1000
            })
            return
          }
          tags[i].selected = false
          for (let j in bottomTags) {
            if (bottomTags[j].name == tagName) {
              bottomTags.splice(j, 1)
              break
            }
          }
          that.setData({
            tags: tags,
            bottomTags: bottomTags
          })
          wx.showToast({
            title: '移除成功',
            duration: 1000
          })
        } else {
          tags[i].selected = true
          var newTag = {
            name: tagName
          }
          bottomTags.push(JSON.parse(JSON.stringify(newTag)))
          that.setData({
            tags: tags,
            bottomTags: bottomTags
          })
          wx.showToast({
            title: '添加成功',
            duration: 1000
          })
        }
        return
      }
    }
  },

  addInputTag: function() {
    var that = this
    console.log("addInputTag")
    var inputText = that.data.inputText
    var tags = that.data.tags
    var bottomTags = that.data.bottomTags
    
    var city = that.data.city
    if (city == inputText) {
      wx.showToast({
        title: '此标签已添加',
        icon: 'error',
        duration: 1000
      })
      return
    }
    for (let i in tags) {
      if (tags[i].content == inputText) {
        if (tags[i].selected) {
          wx.showToast({
            title: '此标签已添加',
            icon: 'error',
            duration: 1000
          })
        } else {
          tags[i].selected = true
          var newTag = {
            name: inputText
          }
          bottomTags.push(JSON.parse(JSON.stringify(newTag)))
          that.setData({
            tags: tags,
            bottomTags: bottomTags
          })
          wx.showToast({
            title: '添加成功',
            duration: 1000
          })
        }
        return
      }
    }
    // 新标签
    that.addNewTag()
  },

  addNewTag: function() {
    var that = this
    console.log("addNewTag")
    wx.showModal({
      title: "新建标签",
      content: "此标签暂未创建，是否新建并添加？",
      // cancelText: "取消",
      // cancelColor: '#576B95',
      confirmText: "确认",
      success (res) {
        if (res.confirm) {
          var inputText = that.data.inputText
          var tags = that.data.tags
          var bottomTags = that.data.bottomTags
          var matchedNumber = that.data.matchedNumber + 1
          var newTag1 = {
            content: inputText,
            read: 0,
            matched: true,
            selected: true,
          }
          tags.push(JSON.parse(JSON.stringify(newTag1)))
          var newTag2 = {
            name: inputText
          }
          bottomTags.push(JSON.parse(JSON.stringify(newTag2)))
          that.setData({
            tags: tags,
            bottomTags: bottomTags,
            matchedNumber: matchedNumber
          })
          wx.showToast({
            title: '新建并添加成功',
            duration: 1000
          })
        }
      },
      fail (res) { console.log(res) }
    })
  },

  deleteBottomTag: function(e) {
    var that = this
    console.log("deleteBottomTag")
    var tagName = e.currentTarget.dataset.name
    var bottomTags = that.data.bottomTags
    for (let i in bottomTags) {
      if (bottomTags[i].name == tagName) {
        bottomTags.splice(i, 1)
        break
      }
    }
    var tags = that.data.tags
    for (let i in tags) {
      if (tags[i].content == tagName) {
        tags[i].selected = false
        break
      }
    }
    that.setData({
      tags: tags,
      bottomTags: bottomTags
    })
    wx.showToast({
      title: '移除成功',
      duration: 1000
    })
  },

  inputChange: function(e) {
    var that = this
    var tags = that.data.tags
    var inputText = e.detail.value
    var matchedNumber = 0
    for (let i in tags) {
      if (tags[i].content.indexOf(inputText) != -1) {
        tags[i].matched = true
        ++matchedNumber
      } else {
        tags[i].matched = false
      }
    }
    that.setData({
      tags: tags,
      inputText: inputText,
      matchedNumber: matchedNumber
    });
  },

  inputClear: function() {
    var that = this
    var tags = that.data.tags
    for (let i in tags) {
      tags[i].matched = false
    }
    that.setData({
      tags: tags,
      inputText: '',
      matchedNumber: 0
    });
  },
  
  confirmTags: function() {
    var that = this
    console.log('confirmTags')

    var pages = getCurrentPages()
    var curPage = pages[pages.length - 1] //当前页面
    var prePage = pages[pages.length - 2]
    
    var bottomTags = that.data.bottomTags
    prePage.setData({
      bottomTags: bottomTags,
    })
    
    wx.navigateBack({
      delta: 1,
    })
  },

  getTags: function() {
    var that = this
    wx.request({
      url: utils.server_hostname + "/api/core/tags/getTagList/",
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {},
      success: function(res) {
        console.log(res)
        var tags = res.data
        tags.sort(function (x, y) {
          return y.read - x.read;
        })
        for (let i in tags) {
          tags[i].selected = that.isSelected(tags[i].content)
          tags[i].matched = false
        }
        that.setData({
          tags: tags
        })
        that.checkNewCity()
        that.checkNewBottomTags()
      },
      fail: function(err) {
        console.log(err)
        wx.showToast({
          title: '标签拉取失败',
          duration: 1000,
          icon: 'error'
        })
      }
    })
  },

  isSelected: function(tagName) {
    var that = this
    var bottomTags = that.data.bottomTags
    var city = that.data.city
    if (city == tagName) {
      return true
    }
    for (let i in bottomTags) {
      if (bottomTags[i].name == tagName) {
        return true
      }
    }
    return false
  },

  checkNewCity: function() {
    var that = this
    var city = that.data.city
    var tags = that.data.tags
    for (let i in tags) {
      if (tags[i].content == city) {
        return
      }
    }
    var newTag = {
      content: city,
      read: 0,
      matched: false,
      selected: true,
    }
    tags.push(JSON.parse(JSON.stringify(newTag)))
    that.setData({
      tags: tags
    })
  },

  checkNewBottomTags: function() {
    var that = this
    var tags = that.data.tags
    var bottomTags = that.data.bottomTags
    for (let i in bottomTags) {
      var hasFound = false
      for (let j in tags) {
        if (bottomTags[i].name == tags[j].content) {
          hasFound = true
          break
        }
      }
      if (!hasFound) {
        var newTag = {
          content: bottomTags[i].name,
          read: 0,
          matched: false,
          selected: true,
        }
        tags.push(JSON.parse(JSON.stringify(newTag)))
        that.setData({
          tags: tags
        })
      }
    }
  },

  emptyBehavior: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    // console.log(options)
    var bottomTags = options.bottomTags ? JSON.parse(options.bottomTags): []
    var city = options.city
    that.setData({
      bottomTags: bottomTags,
      city: city
    })
    that.getTags()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})

{/* <l-index-list scroll-top="{{scrollTop}}" sidebar-data="{{sidebarData}}" bind:linselected="onSelected">
  <!-- 使用插槽自定义 Tip -->
  <view slot="tip">
    <view>{{indexText}}</view>
  </view>

  <view wx:for="{{tags}}" wx:key="key" wx:for-item="lList">
    <!-- 使用插槽自定义 Anchor -->
    <l-index-anchor></l-index-anchor>

    <view wx:for="{{lList}}" wx:key="key" wx:for-item="loc">
      <l-button l-class="loc_name_button" l-label-class="loc_name_label"
                data-text="{{loc.content}}" size="long" width="300"
                bg-color="#fff" bind:lintap="setTag" z-index="0">
        <view class="loc_name_text">{{loc.content}}</view>
      </l-button>
      <!--{{loc.name}}-->
    </view>
  </view>
</l-index-list> */}