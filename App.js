import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, PermissionsAndroid, Button, ActivityIndicator, ScrollView } from "react-native";
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import RNEChartsPro from "react-native-echarts-pro";
function textDayToEmoji(textDay) {
  if (textDay.includes('雪')) return '❄'
  if (textDay.includes('电')) return '🌩'
  if (textDay.includes('雨')) return '🌧'
  if (textDay.includes('云')) return '⛅'
  return '☀'
}

function randomColor() {
  return ["#7FDEF0", "#F097BC", "#A39B4E", "#4694A3", "#F0E267", "#777FF0", "#8EF060", "#F0AD90"][Math.floor(Math.random() * 8)] + "aa"
}
const App = () => {
  const [position, setPosition] = useState()
  const [cityInfo, setCityInfo] = useState()
  const [weather, setWeather] = useState()
  const [todatWeather, setTodatWeather] = useState()
  const [air, setAir] = useState()
  const [err, setErr] = useState("请先获取地理位置信息")
  const requestACCESS_FINE_LOCATION = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '获取地理位置',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(info => {
          setPosition([info.coords.longitude, info.coords.latitude])
          //城市定位
          axios.get(
            'https://restapi.amap.com/v3/geocode/regeo?' +
            'key=0f4a47d457d5db249b1d7c8cd8a24380&' +
            `location=${info.coords.longitude},${info.coords.latitude}`
          ).then((res) => {
            let cityInfo = res.data
            if (cityInfo && cityInfo.info && cityInfo.info) {
              setCityInfo({
                ...cityInfo.regeocode.addressComponent
              })
            }
          }).catch((e) => {
            setErr("网络错误")
          })
          //天气
          axios.get(
            'https://devapi.qweather.com/v7/weather/7d?' +
            'key=8c1528bb17e84b818894f1c740f65ab7&' +
            `location=${info.coords.longitude},${info.coords.latitude}`
          ).then((res) => {
            if (res.data.code == 200) {
              setWeather(res.data.daily)
              let day0 = res.data.daily[0]
              let todatWeather = []
              const reday = ["sunrise", "sunset", "windDirDay", "windSpeedDay", "humidity", "pressure"]
              const redayC = ["日升☀", "日落🌕", "风向🌪", "风力🌀", "湿度💧", "气压🧴"]
              for (let i = 0; i < reday.length; i++) {
                todatWeather[i] = {}
                todatWeather[i].value = day0[reday[i]]
                todatWeather[i].label = redayC[i]
              }
              setTodatWeather(todatWeather)
            }
          }).catch((e) => {
            setErr("网络错误")
          })
          //空气质量
          axios.get(
            'https://devapi.qweather.com/v7/air/now?' +
            'key=8c1528bb17e84b818894f1c740f65ab7&' +
            `location=${info.coords.longitude},${info.coords.latitude}`
          ).then((res) => {
            if (res.data.now) {
              setAir({ aqi: res.data.now.aqi, category: res.data.now.category })
            }
          }).catch((e) => {
            setErr("网络错误")
          })
        });
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  }, [])
  useEffect(() => { requestACCESS_FINE_LOCATION() }, [])
  return (
    <ScrollView style={[styles.container]}>
      <View style={[styles.positionContainer]}>
        <View style={{
          width: "30%",
          display: "flex", justifyContent: "center",
          flexDirection: "column", alignItems: "center"
        }}>
          {
            cityInfo ? (<View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Text style={{ fontSize: 24, color: "black" }}>🏙{cityInfo.province}</Text>
              <Text style={{ fontSize: 20, color: "black" }}>🏢{cityInfo.city}</Text>
              <Text style={{ fontSize: 16, color: "black" }}>🏚{cityInfo.district}</Text>
              <Button title="重新获取信息" onPress={() => {
                setAir()
                setCityInfo()
                setPosition()
                setTodatWeather()
                setWeather()
                setErr("加载中")
                requestACCESS_FINE_LOCATION()
              }} />
            </View>) :
              <View>
                <Button title="获取位置" onPress={() => {
                  setErr("加载中")
                  requestACCESS_FINE_LOCATION()
                }} />
              </View>
          }
        </View>
        <View style={{ width: "65%" }}>
          {air ? <View >
            <RNEChartsPro height={200} option={{
              series: [
                {
                  type: 'gauge',
                  startAngle: 180,
                  endAngle: -160,
                  center: ['50%', '50%'],
                  radius: '80%',
                  min: 0,
                  max: 500,
                  splitNumber: 20,
                  axisLine: {
                    lineStyle: {
                      width: 6,
                      color: [
                        [0.1, '#07e20c'],
                        [0.2, '#f9de03'],
                        [0.3, '#e43b05'],
                        [0.4, '#680b63'],
                        [0.6, '#aaaaaa'],
                        [1, '#000000'],
                      ]
                    }
                  },
                  pointer: {
                    icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                    length: '12%',
                    width: 10,
                    offsetCenter: [0, '-60%'],
                    itemStyle: {
                      color: 'inherit'
                    }
                  },
                  axisTick: {
                    length: 4,
                    lineStyle: {
                      color: 'inherit',
                      width: 1
                    }
                  },
                  splitLine: {
                    length: 10,
                    lineStyle: {
                      color: 'inherit',
                      width: 1
                    }
                  },
                  axisLabel: {
                    color: '#464646',
                    fontSize: 10,
                    distance: -30,
                    rotate: 'tangential',
                    formatter: function (value) {
                      if (value === 25) {
                        return '优';
                      } else if (value === 75) {
                        return '良';
                      } else if (value === 125) {
                        return '轻';
                      } else if (value === 175) {
                        return '中';
                      } else if (value === 250) {
                        return '重';
                      } else if (value === 400) {
                        return '严重';
                      }
                      return '';
                    }
                  },
                  title: {
                    offsetCenter: [0, '30%'],
                    fontSize: 12
                  },
                  detail: {
                    fontSize: 12,
                    offsetCenter: [0, '-15%'],
                    valueAnimation: true,
                    color: 'inherit'
                  },
                  data: [
                    {
                      value: air.aqi,
                      name: air.category
                    }
                  ]
                }
              ]
            }}></RNEChartsPro>
          </View>
            : <ActivityIndicator size={50} />}
        </View>
      </View>
      <View style={{ paddingTop: 25 }}>
        {Array.isArray(weather) ? <View style={{ overflow: "scroll" }}>
          <RNEChartsPro width={360} option={{
            title: {
              text: '一周气温'
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {},
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: weather.map((v) => v.fxDate.substring(5))
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: '{value} °C'
              }
            },
            series: [
              {
                name: '高温',
                type: 'line',
                data: weather.map((v) => v.tempMax),
                markPoint: {
                  data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                  ],
                  itemStyle: {
                    color: "#c7034a"
                  }
                },
                lineStyle: {
                  color: "#d63b04"
                }
              },
              {
                name: '低温',
                type: 'line',
                data: weather.map((v) => v.tempMin),
                markPoint: {
                  data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }],
                  itemStyle: {
                    color: "#6cf"
                  }
                },
                lineStyle: {
                  color: "#66ccff"
                },
              }
            ]
          }} />
        </View> : <ActivityIndicator size={50} />}

      </View>
      <View>
        {weather && todatWeather ? <View>
          <Text style={{ fontSize: 28, textAlign: "center", color: "#6acfaf" }}>七日天气</Text>
          <ScrollView style={{ display: "flex", flexDirection: "row" }} horizontal={true}>
            {
              weather.map((v) => {
                return (<View style={{
                  marginRight: 10, display: "flex", flexDirection: "column", alignItems: "center",
                  backgroundColor: "#66ccff", padding: 5
                }} key={v.fxDate}  >
                  <Text style={{ fontSize: 30 }}>{textDayToEmoji(v.textDay)}</Text>
                  <Text>{v.textDay}</Text>
                  <Text>{v.fxDate}</Text>
                </View>)
              })
            }
          </ScrollView>
          <View>
            <Text style={{ fontSize: 28, textAlign: "center", color: "#6abccf" }}>今日天气详情</Text>
            <View style={{
              display: "flex", width: "100%",
              justifyContent: "space-around", flexDirection: "row",
              flexWrap: "wrap"
            }}>
              {
                todatWeather.map((v) => {
                  return (
                    <View key={v.label} style={[styles.todayDetail, { borderRadius: 15, backgroundColor: randomColor() }]}>
                      <Text style={{ fontSize: 24, color: "black" }}>{v.label}</Text>
                      <Text style={{ fontSize: 20, color: "black" }}>{v.value}</Text>
                    </View>)
                })
              }
            </View>
          </View>
        </View>
          :
          <View style={{ display: "flex", alignItems: "center" }}>
            <ActivityIndicator color={err === "网络错误" ? "red" : ""} size={80} />
            <Text style={{ color: "red" }}>{err}</Text>
          </View>
        }
      </View>
    </ScrollView >)
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingHorizontal: 10,
  },
  positionContainer: {
    height: "100%",
    backgroundColor: "rgba(55,55,55,0.2)",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    height: 200,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  todayDetail: {
    padding: 10,
    width: 130,
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  }
});

export default App;