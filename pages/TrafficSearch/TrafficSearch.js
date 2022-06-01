// pages/TrafficSearch/TrafficSearch.js
const utils = require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    locList: [
      // [ // 热
      //   {
      //     id: 1,
      //     name: "北京",
      //   },
      //   {
      //     id: 2,
      //     name: "成都",
      //   },
      //   {
      //     id: 3,
      //     name: "广州",
      //   },
      //   {
      //     id: 4,
      //     name: "深圳",
      //   },
      //   {
      //     id: 5,
      //     name: "长沙",
      //   },
      //   {
      //     id: 6,
      //     name: "杭州",
      //   },
      //   {
      //     id: 7,
      //     name: "武汉",
      //   },
      //   {
      //     id: 8,
      //     name: "苏州",
      //   },
      // ],
      // [ // A
      //   {
      //     id: 11,
      //     name: "鞍山",
      //   },
      //   {
      //     id: 12,
      //     name: "阿尔山",
      //   },
      // ],
      // [ // B
      //   {
      //     id: 21,
      //     name: "包头",
      //   },
      //   {
      //     id: 22,
      //     name: "宝鸡",
      //   },
      //   {
      //     id: 7,
      //     name: "北京",
      //   },
      // ],
    ],
    cityD: "",
    cityA: "",

    showPageContainer: false,
    showChooseD: false,
    showChooseA: false,
    showLeaveDate: false,

    leaveDate: "添加单程日期",
    oTime: "",

    minDate: new Date(2022, 4, 1).getTime(), // onload
    maxDate: new Date(2023, 12, 1).getTime(), // onload
    curDate: new Date(2022, 4, 31).getTime(), // onload

    isSearchByNum: false,
    planeNum: "",

    scrollTop: undefined,
    //"热", 
    sidebarData: ["热", "A", "B"],
    //sidebarData: ["热", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    //              "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],

    toView: 'green',
    dataList:[],
    get_data: false,

    searchType: "飞机"
  },

  changeTabs: function(e) {
    console.log(e)
    this.setData({
      searchType: e.detail.activeKey
    })
  },

  enterCityD: function(e) {
    // console.log(e.detail.value)
    this.setData({
      cityD: e.detail.value
    })
  },

  clearCityD: function() {
    // console.log('clearCityD')
    this.setData({
      cityD: ''
    })
  },

  enterCityA: function(e) {
    // console.log(e.detail.value)
    this.setData({
      cityA: e.detail.value
    })
  },

  clearCityA: function() {
    // console.log('clearCityA')
    this.setData({
      cityA: ''
    })
  },

  exchangeDA: function() {
    console.log("exchangeDA")
    var newD = this.data.cityA
    var newA = this.data.cityD
    this.setData({
      cityD: newD,
      cityA: newA
    })
  },
  
  chooseLeaveDate: function() {
    console.log("chooseLeaveDate")
    this.setData({
      showLeaveDate: true
    })
  },
    
  addZero: function(num) {
    if (parseInt(num) < 10) {
      num = "0" + num
    }
    return num;
  },
  setLeaveDate: function(e) {
    console.log(e);
    var lDate = e.detail;
    var oDate = new Date(lDate),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = oYear + '-' + this.addZero(oMonth) + '-' + this.addZero(oDay);
        // oHour = oDate.getHours(), oMin = oDate.getMinutes(), oSen = oDate.getSeconds(),
    this.setData({
      leaveDate: oTime,
      oTime: oTime,
      showLeaveDate: false
    })
  },
  
  toSearchByNum: function(e) {
    console.log(e)
    var that = this
    if (e.detail == true) {
      this.setData({
        isSearchByNum: !that.data.isSearchByNum
      })
    }
    else {
      this.setData({
        isSearchByNum: !that.data.isSearchByNum
      })
    }
  },

  enterPlaneNum: function(e) {
    // console.log(e.detail.value)
    this.setData({
      planeNum: e.detail.value
    })
  },

  clearPlaneNum: function() {
    // console.log('clearPlaneNum')
    this.setData({
      PlaneNum: ''
    })
  },

  integrateSearch: function(e) {
    console.log("integrateSearch")
    /*wx.showToast({
      title: '查询中',
      duration: 1000,
      icon: 'loading'
    })*/

    if (this.data.isSearchByNum == false) { //综合查询
      if (this.data.cityD == '') {
        wx.showToast({
          title: '请输入出发地',
          duration: 1000,
          icon: 'error'
        })
        return
      } else if (this.data.cityA == '') {
        wx.showToast({
          title: '请输入目的地',
          duration: 1000,
          icon: 'error'
        })
        return
      }
      var url = '/pages/IntegratedQuery/IntegratedQuery?'
      url = url + "departure=" + this.data.cityD
      url = url + "&" + "arrival=" + this.data.cityA
      url = url + "&" + "date=" + this.data.oTime // 2022-05-05
      url = url + "&" + "searchType=" + this.data.searchType
      console.log(url)
      wx.navigateTo({
        url: url,
      });
    } else { //航班号查询
      var oDate = new Date(),
          oYear = oDate.getFullYear(),
          oMonth = oDate.getMonth() + 1,
          oDay = oDate.getDate(),
          oTime = oYear + '-' + this.addZero(oMonth) + '-' + this.addZero(oDay)

      var url = '/pages/AirplaneSearch/AirplaneSearch?'
      url = url + "planeNum=" + this.data.planeNum.toUpperCase()
      url = url + "&" + "date=" + oTime
      console.log(url)
      wx.navigateTo({
        url: url,
      });
    }
  },

  /*onPageScroll(res) {
    this.setData({
      scrollTop: res.scrollTop,
    })
  },*/
    
  // 页面监听函数
  onPageScroll(res) {
    wx.lin.setScrollTop(res.scrollTop)
    // this.setData({
    //   scrollTop: res.scrollTop,
    // })
    // console.log(res.scrollTop)
  },

  chooseD: function() {
    this.setData({
        showChooseD: true,
        showPageContainer: true
    })
  },
  chooseA: function() {
    this.setData({
        showChooseA: true,
        showPageContainer: true
    })
  },
  selectCity: function(e) {
    console.log(e)
    var newCity = e.currentTarget.dataset.text;

    if (this.data.showChooseD) {
      this.setData({
        cityD: newCity,
        showChooseD: false,
        showPageContainer: false
      })
    } else if (this.data.showChooseA) {
      this.setData({
        cityA: newCity,
        showChooseA: false,
        showPageContainer: false
      })
    }
  },
  closePageContainer: function() {
    console.log("closePageContainer")
    this.setData({
        showChooseD: false,
        showChooseA: false,
        showPageContainer: false
    })
  },

  // 索引被选中的监听函数
  setCityIndex: function(e) {
    console.log(e)
    this.setData({
      indexText: e.detail.index
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    var oDate = new Date(),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = oYear + '-' + this.addZero(oMonth) + '-' + this.addZero(oDay)
    var minDate = oYear + '-' + oMonth + '-01'
    var curDate = new Date().getTime()
    var nextYear = oYear + 1
    var maxDate = nextYear + '-' + oMonth + '-' + oDay
    this.setData({
      // leaveDate: oYear + "年" + oMonth + "月" + oDay + "日",
      // leaveDate: oYear + " 年 " + oMonth + " 月 " + oDay + " 日 ",
      leaveDate: oTime,
      minDate: minDate,
      curDate: curDate,
      maxDate: maxDate,
      oTime: oTime
    })
    /* 2022 */
    this.get_traffic()
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
    console.log("onPullDownRefresh")
    wx.showNavigationBarLoading()
    this.get_traffic()
    wx.showToast({
      title: '已刷新',
      duration: 1000
    });
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
    console.log(this.data)
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

  },

  get_traffic: function(){
    var that = this 
    var token = wx.getStorageSync('token')
  console.log(token)
    wx.request({
      url: utils.server_hostname + "/api/core/flights/getHCFlight",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'token-auth': token
      },
      
      success: function(res) {
        console.log(res.data)
        var tmp = res.data
        for (let i in tmp) {
          tmp[i].departtime = tmp[i].departtime.substring(0, 5)
          tmp[i].arrivaltime = tmp[i].arrivaltime.substring(0, 5)
          tmp[i].airline_Chinese = tmp[i].airline
          tmp[i].airline = utils.airline_Chinese_to_number(tmp[i].airline)
        }
        if (tmp != false) {
          that.setData({
            get_data: true,
            dataList: tmp
          })
        }
      },
      fail: function(res) {}
    })
  },

  navigate2air: function(e) {
    var that = this
    //console.log(e)
    var index = e.currentTarget.dataset.index
    console.log(index)
    wx.navigateTo({
      url: '/pages/PlaneDetail/PlaneDetail?id=' + index,
    })
  },
})

// <!-- 使用 sidebar-data 自定义索引内容 -->
// <l-index-list scroll-top="{{scrollTop}}" sidebar-data="{{sidebarData}}" bind:linselected="setCityIndex">
//   <!-- 使用插槽自定义 Tip -->
//   <view slot="tip" z-index="100">
//     <view>{{indexText}}</view>
//   </view>

//   <view wx:for="{{locList}}" wx:key="key" wx:for-item="lList">
//     <!-- 使用插槽自定义 Anchor -->
//     <l-index-anchor>1</l-index-anchor>
    
//     <view wx:for="{{lList}}" wx:for-item="loc" z-index="99">
//       <l-button l-class="loc_name_button" l-label-class="loc_name_label"
//                 data-text="{{loc.name}}" size="long" width="650"
//                 bg-color="#fff" bind:lintap="selectCity">
//         <view class="loc_name_text">{{loc.name}}</view>
//       </l-button>
//       <!--{{loc.name}}-->
//     </view>
//   </view>
// </l-index-list>