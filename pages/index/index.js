const app = getApp();
const bmap = require("../../libs/bmap-wx.min.js");
const config = require("../../libs/config.js");
const {
  ak
} = config;

const weatherMap = {
  晴: "sunny",
  多云: "cloudy",
  阴: "overcast",
  小雨: "lightrain",
  大雨: "heavyrain",
  雪: "snow",
};
const weatherColorMap = {
  sunny: "#cbeefd",
  cloudy: "#deeef6",
  overcast: "#c6ced2",
  lightrain: "#bdd5e1",
  heavyrain: "#c5ccd0",
  snow: "#aae1fc",
};
// 授权状态标志
const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;

Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherBackground: "",
    futureWeather: [],
    todayTemp: "",
    todayDate: "",
    city: "广州市",
    locationAuthType: UNPROMPTED,
  },
  onLoad: function() {
    this.bmapsdk = new bmap.BMapWX({
      ak,
    });
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting["scope.userLocation"];
        const locationAuthType = auth ?
          AUTHORIZED :
          auth === false ?
          UNAUTHORIZED :
          UNPROMPTED;
        this.setData({
          locationAuthType,
        });
        if (auth) this.getCityAndWeather();
      },
    });
  },
  onPullDownRefresh: function() {
    this.getCityAndWeather(() => wx.stopPullDownRefresh());
  },
  onTapLocation() {
    this.getCityAndWeather();
  },
  getCityAndWeather(callback) {
    wx.getLocation({
      success: () => {
        this.setData({
          locationAuthType: AUTHORIZED,
        });
        this.bmapsdk.weather({
          success: ({
            originalData,
            currentWeather
          }) => {
            this.setToday(currentWeather[0]);
            this.setFutureWeather(originalData.results[0]);
            app.globalData.todayTips = originalData.results[0].index;
          },
        });
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        });
      },
      complete: () => callback && callback(),
    });
  },
  setToday(result) {
    const {
      currentCity,
      date,
      temperature,
      weatherDesc
    } = result;
    const tmpkey1 = weatherDesc.slice(0, 2);
    const tmpkey2 = weatherDesc.slice(-2);
    // console.log(weatherMap[tmpkey])   // 截取的key 不存在呢？阵雨 中雨 小雪 大雪🧐
    this.setData({
      city: currentCity,
      nowTemp: date.slice(date.indexOf("：") + 1, -2) + "°",
      nowWeather: weatherDesc,
      todayDate: date.slice(0, 9),
      todayTemp: temperature.slice(0, -1) + "°",
      nowWeatherBackground: `/images/${
        weatherMap[tmpkey1] ? weatherMap[tmpkey1]
          : (weatherMap[tmpkey1] === undefined) ? weatherMap[tmpkey2] : "cloudy"
      }-bg.png`,
    });
    wx.setNavigationBarColor({
      frontColor: "#000000",
      backgroundColor: weatherColorMap[weatherMap[tmpkey1] ? weatherMap[tmpkey1] :
        (weatherMap[tmpkey1] === undefined) ? weatherMap[tmpkey2] : "cloudy"],
    });
  },
  setFutureWeather(result) {
    const {
      weather_data
    } = result;
    const futureWeather = [];
    for (let i = 0; i < weather_data.length; i++) {
      futureWeather.push({
        date: weather_data[i].date,
        temp: weather_data[i].temperature,
        weather: weather_data[i].weather,
      });
    }

    futureWeather[0].date = "今日";
    this.setData({
      futureWeather,
    });
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: `/pages/list/list`,
    });
  },
});