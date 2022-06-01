// pages/launch/launch.js
const utils = require("../../utils/util.js");

function Loc(name) {
  this.name = name;
}

var currentDateTime = new Date()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,

    title:"",
    startDate:"请选择开始日期",
    startTime:"请选择开始时间",
    endDate:"请选择结束日期",
    endTime:"请选择结束时间",
    deadDate:"请选择截止日期",
    deadTime:"请选择截止时间",
    location:{
      latitude:-1,
      longitude:-1,
      name:"",
      address:{
        city:"",
        district:"",
        nation:"",
        province:"",
        street:"",
        street_number:""
      }
    },
    locName:"请选择活动地点",
    capacity:"-1",
    content:"",

    bottomTags: [
      // {
      //   name: "咱就是说",
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
    insideTags: []
  },

  onSubmit: function() {
    var that = this
    var formatCheck = ""
    if (this.data.title == "") formatCheck = "请输入标题"
    else if (this.data.startDate == "请选择开始日期") formatCheck = "请选择开始日期"
    else if (this.data.startTime == "请选择开始时间") formatCheck = "请选择开始时间"
    else if (this.data.endDate == "请选择结束日期") formatCheck = "请选择结束日期"
    else if (this.data.endTime == "请选择结束时间") formatCheck = "请选择结束时间"
    else if (this.data.location.latitude == -1) formatCheck = "请选择活动地点"
    else if (!(/(^[1-9]\d*$)/.test(this.data.capacity))) formatCheck = "活动人数不合法"
    else if (this.data.deadDate == "请选择截止日期") formatCheck = "请选择截止日期"
    else if (this.data.deadTime == "请选择截止时间") formatCheck = "请选择截止时间"
    else if (this.data.content == '') formatCheck = "请输入活动详情描述"
    else {
      var year = parseInt(currentDateTime.getFullYear())
      var month = parseInt(currentDateTime.getMonth())
      var day = parseInt(currentDateTime.getDate())
      var hour = parseInt(currentDateTime.getHours())
      var minute = parseInt(currentDateTime.getMinutes())
      var date = this.data.deadDate.split("-")

      if (parseInt(date[0]) < year) formatCheck = "截止早于现在"
      else if (parseInt(date[0]) == year) {
        if (parseInt(date[1]) < month + 1) formatCheck = "截止早于现在"
        else if (parseInt(date[1]) == month + 1) {
          // console.log(1)
          if (parseInt(date[2]) < day) formatCheck = "截止早于现在"
          else if (parseInt(date[2]) == day) {
            var time = this.data.deadTime.split(":")
            if (parseInt(time[0]) < hour) formatCheck = "截止早于现在"
            else if (parseInt(time[0]) == hour && parseInt(time[1]) <= minute)  formatCheck = "截止早于现在"
          }
        }
      }

      var start_time = that.data.startDate + 'T' + that.data.startTime
      var end_time = that.data.endDate + 'T' + that.data.endTime
      var deadline = that.data.deadDate + 'T' + that.data.deadTime

      if (end_time <= start_time) formatCheck = "结束早于开始"
      else if (deadline > end_time) formatCheck = "截止晚于结束"
    }

    if (formatCheck != "") {
      wx.showToast({
        title: formatCheck,
        icon: 'error',
        duration: 1000
      })
      return
    }

    var that = this;
    var token = (wx.getStorageSync('token') == '')? "notoken" : wx.getStorageSync('token')
    wx.showLoading({
      title: '上传中',
    })
    
    // console.log(that.data.startDate + 'T' + that.data.startTime)
    // console.log(that.data.endDate + 'T' + that.data.endTime)
    // console.log(that.data.deadDate + 'T' + that.data.deadTime)
    // console.log(that.data.title)
    // console.log(that.data.content)
    // console.log(that.data.capacity)
    // console.log(that.data.location)

    wx.request({
      url: utils.server_hostname + "/api/core/companions/",
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      data: {
        start_time: that.data.startDate + 'T' + that.data.startTime,
        end_time: that.data.endDate + 'T' + that.data.endTime,
        deadline: that.data.deadDate + 'T' + that.data.deadTime,
        title: that.data.title,
        content: that.data.content,
        capacity: that.data.capacity,
        position: that.data.location
      },

      success: function(data) {
        console.log(data)
        wx.hideLoading({
          success: (res) => {},
        })
        
        if (data.data.error_code == 605 || data.data.error_code == 400) {
          utils.loginExpired()
          return
        }

        // NEW
        var companion_id = data.data.id
        that.uploadTags(companion_id, 'inside')
        that.uploadTags(companion_id, 'bottom')
        // NEW end

        // loginExpired
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 500
        })

        setTimeout(function () {
          var pages = getCurrentPages();
          var url = '/' + pages[pages.length - 2].route

          wx.navigateBack({
            delta: 1,
          })

          if (url == "/pages/MyZone/MyZone") {
            wx.redirectTo({
              url: url,
            })
          }
        }, 500)
      },
      fail: function(res) { console.log(res); }
    })
  },

  inputTitle: function(e) {
    // console.log("标题为" + e.detail.value)
    this.setData({
      title:e.detail.value
    })
  },

  startDateChange: function(e) {
    // console.log("开始日期修改为" + e.detail.value)
    this.setData( {
      startDate:e.detail.value
    })
  },

  startTimeChange: function(e) {
    // console.log("开始时间修改为" + e.detail.value)
    this.setData( {
      startTime:e.detail.value
    })
  },

  endDateChange: function(e) {
    // console.log("结束日期修改为" + e.detail.value)
    this.setData({
      endDate:e.detail.value
    })
  },

  endTimeChange: function(e) {
    // console.log("结束时间修改为" + e.detail.value)
    this.setData({
      endTime:e.detail.value
    })
  },

  deadDateChange: function(e) {
    // console.log("截止日期修改为" + e.detail.value)
    this.setData( {
      deadDate:e.detail.value
    })
  },

  deadTimeChange: function(e) {
    // console.log("截止时间修改为" + e.detail.value)
    this.setData({
      deadTime:e.detail.value
    })
  },

  setLoc:function (){
    var that = this;
    utils.authorize()
    wx.chooseLocation({
      success: function (res) {
        // console.log(res)

        var name = res.name
        var latitude = res.latitude
        var longitude = res.longitude
        var locAddress = res.address

        var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" 
        + latitude + "," + longitude + "&key=" + utils.subkey;
        wx.request({        
          url: getAddressUrl,
          success: function (address) {   
            address = address.data.result   
            // console.log(address)

            that.setData({
              location: {
                latitude: latitude,
                longitude: longitude,
                name: name,
                address: address.address_component
              },
              locName: locAddress + ' · ' + name
            })
            // console.log(that.data)
          },
          fail: function(res) { console.log(res) }
        })
      },
      fail: function(res) { console.log(res); }
    })
  },

  capacityInput: function(e) {
    // console.log("容量为" + e.detail.value)
    this.setData({
      capacity:e.detail.value
    })
  },

  // NEW

  chooseBottomTags: function() {
    var that = this
    console.log("chooseBottomTags")
    that.navigate2AddTag()
  },

  navigate2AddTag: function() {
    var that = this
    var url = '/pages/AddTag/AddTag?'
    url = url + "bottomTags=" + JSON.stringify(that.data.bottomTags)
    url = url + "&" + "city=" + that.data.location.address.city
    wx.navigateTo({
      url: url,
    });
  },

  deleteBottomTag: function(e) {
    var that = this
    console.log("deleteBottomTag")
    var bottomTags = that.data.bottomTags
    var tagName = e.currentTarget.dataset.name
    for (let i in bottomTags) {
      if (tagName == bottomTags[i].name) {
        bottomTags.splice(i, 1)
        break
      }
    }
    that.setData({
      bottomTags: bottomTags
    })
    wx.showToast({
      title: '已移除标签',
      duration: 1000
    })
  },

  deleteInsideTag: function(e) {
    var that = this
    console.log("deleteinsideTag")
    var insideTags = that.data.insideTags
    var tagName = e.currentTarget.dataset.name
    for (let i in insideTags) {
      if (tagName == insideTags[i].name) {
        insideTags.splice(i, 1)
        break
      }
    }
    that.setData({
      insideTags: insideTags
    })

    var content = that.data.content
    var tagLen = tagName.length
    for (var i = 0; i < content.length; ++i) {
      if (tagName == content.substr(i, tagLen)) {
        content = content.substring(0, i-1) + content.substring(i + tagLen + 1)
        // content = content.substring(0, i-1)
        //         + content.substring(i, i+tagLen)
        //         + content.substring(i+tagLen+1)
      }
    }
    that.setData({
      content: content
    })

    wx.showToast({
      title: '移除成功',
      duration: 1000
    })
  },

  isNewInsideTag: function(curTag, curInsideTags) {
    for (let i in curInsideTags) {
      if (curInsideTags[i].name == curTag.name) {
        return false
      }
    }
    return true
  },

  inputDetail:function(e) {
    var that = this
    // console.log("活动详情修改为" + e.detail.value)
    var value = e.detail.value
    that.setData({
      content: value
    })

    var cnt = 0
    var curTag = {
      name: ''
    }
    var curInsideTags = []
    for (var i = 0; i < value.length; ++i) {
      if (value[i] == '#') {
        cnt++
        if (cnt % 2 == 1) { // 左#
          curTag.name = ''
        } else if (that.isNewInsideTag(curTag, curInsideTags)) { // 右#
          curInsideTags.push(JSON.parse(JSON.stringify(curTag)))
        }
        continue
      }
      if (cnt % 2 == 1) {
        curTag.name += value[i]
      }
    }
    that.setData({
      insideTags: curInsideTags
    })
  },

  uploadTags: function(companion_id, type) {
    var that = this
    console.log("uploadTags("+type+")")
    
    var url
    var names = []
    if (type == 'inside') {
      url = utils.server_hostname + "/api/core/tags/saveComInTextTags/"
      var insideTags = that.data.insideTags
      for (let i in insideTags) {
        names.push(insideTags[i].name)
      }
    } else if (type == 'bottom') {
      url = utils.server_hostname + "/api/core/tags/saveComEndTextTags/"
      var bottomTags = that.data.bottomTags
      for (let i in bottomTags) {
        names.push(bottomTags[i].name)
      }
      var city = that.data.location.address.city
      names.push(city)
    }

    if (names.length > 0) {
      wx.request({
        url: url,
        method: 'POST',
        header: {
          'content-type': 'application/json',
        },
        data: {
          companion_id: companion_id,
          names: names
        },
        success: function(res) {
          // console.log(res)
          if (res.data == false) {
            wx.showToast({
              title: '标签上传失败',
              duration: 1000,
              icon: 'error'
            })
          }
        },
        fail: function(err) {
          console.log(err)
          wx.showToast({
            title: '标签上传失败',
            duration: 1000,
            icon: 'error'
          })
        }
      })
    }
  },

  onLoad:function(){
    var app = getApp()
    var show = app.globalData.show
    this.setData({
      // show: show
      show: true
    })
  },

  emptyBehavior: function() {}
})