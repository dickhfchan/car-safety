<template>
  <div class="baidu-map-fencing">
    <div class="baidu-map-fencing__map" :id="id"></div>
  </div>
</template>
<script>
import BaiduMapTrackRender from './BaiduMapTrackRender.vue'
import { windowLoaded } from 'helper-js'
//
function loadBaiduMapDrawingManager() {
  const isLoaded = () => window.BMapLib && window.BMapLib.DrawingManager
  if (isLoaded()) {
    return Promise.resolve()
  }
  const fun = loadBaiduMapDrawingManager
  return windowLoaded().then(() => {
    if (fun.loaded) {
      return Promise.resolve()
    } else {
      if (!fun.requested) {
        fun.requested = true
        const script = document.createElement('script')
        script.src = `http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js`
        document.body.appendChild(script)
        const script2 = document.createElement('script')
        script2.src = `http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js`
        document.body.appendChild(script2)
      }
      return new Promise(function(resolve, reject) {
        const requestInterval = window.setInterval(function () {
          if (isLoaded()) {
            window.clearInterval(requestInterval)
            resolve()
          }
        }, 10)
      })
    }
  })
}

export default {
  props: {
    // points: {}, //
    // vehicles: {},
    ak: {},
    // coordinateConversionLimit: { default: 10 },
  },
  data() {
    return {
      id: 'BaiduMapFencinge' + this._uid,
      BMapApiLoading: true,
      // don't observe
      // BMap: null,
      // map: null,
      // pathPolyline: null,
      // BMapPoints: null,
    }
  },
  watch: {
  },
  methods: {
    autoCenterAndZoom(...args) { BaiduMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady() { return BaiduMapTrackRender.methods.mapReady.apply(this) },
    checkSize() { BaiduMapTrackRender.methods.checkSize.apply(this) },
  },
  created() {
    // // don't observe
    // this.convertedPoints = {}
    //
    this.mapReady().then(({BMap, map}) => {
      loadBaiduMapDrawingManager().then(() => {
        const DrawingManager = window.BMapLib.DrawingManager
        this.BMap = BMap
        this.BMapApiLoading = false
          //
        map.clearOverlays()
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)
        map.enableScrollWheelZoom()
        map.addControl(new BMap.CityListControl({
          anchor: window.BMAP_ANCHOR_TOP_LEFT,
          offset: new BMap.Size(10, 20),
        // 切换城市之间事件
        // onChangeBefore: function(){
        //    alert('before');
        // },
        // 切换城市之后事件
        // onChangeAfter:function(){
        //   alert('after');
        // }
        }))
        var overlays = []
        var overlaycomplete = function(e) {
          overlays.push(e.overlay)
        }
        var styleOptions = {
          strokeColor: 'blue',    // 边线颜色。
          fillColor: 'blue',      // 填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3,       // 边线的宽度，以像素为单位。
          strokeOpacity: 0.8,     // 边线透明度，取值范围0 - 1。
          fillOpacity: 0.6,      // 填充的透明度，取值范围0 - 1。
          strokeStyle: 'solid' // 边线的样式，solid或dashed。
        }
       // 实例化鼠标绘制工具
        var drawingManager = new DrawingManager(map, {
          isOpen: false, // 是否开启绘制模式
          enableDrawingTool: true, // 是否显示工具栏
          drawingToolOptions: {
            anchor: window.BMAP_ANCHOR_TOP_RIGHT, // 位置
            offset: new BMap.Size(5, 5), //偏离值
          },
          circleOptions: styleOptions, // 圆的样式
          polylineOptions: styleOptions, // 线的样式
          polygonOptions: styleOptions, // 多边形的样式
          rectangleOptions: styleOptions // 矩形的样式
        })
      // 添加鼠标绘制工具监听事件，用于获取绘制结果
        drawingManager.addEventListener('overlaycomplete', overlaycomplete)
        // function clearAll() {
        //   for (var i = 0; i < overlays.length; i++) {
        //     map.removeOverlay(overlays[i])
        //   }
        //   overlays.length = 0
        // }
          // const polygon = new BMap.Polygon([
          //   new BMap.Point(116.387112, 39.920977),
          //   new BMap.Point(116.385243, 39.913063),
          //   new BMap.Point(116.394226, 39.917988),
          //   new BMap.Point(116.401772, 39.921364),
          //   new BMap.Point(116.41248, 39.927893),
          // ], {strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5})  //
          // polygon.enableEditing()
          // map.addOverlay(polygon)   //
      })
    })
    window.addEventListener('resize', this.checkSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkSize)
  }
}

</script>
<!-- <script type="text/javascript" src="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>
<link rel="stylesheet" href="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" /> -->
<style lang="scss">
.baidu-map-fencing{
  width: 100%;
  height:100%;
  min-height: 50px;
  /* prevent other css effect baidumap overlay */
  svg{
    max-width: inherit;
  }
}
.baidu-map-fencing__map{
  width: 100%;
  height: 100%;
}
// city
.BMap_CityListCtrl.BMap_noprint.anchorTL {
  a{
    color: #000;
  }
  .citylist_popup_main .city_content_top{
    height: auto;
  }
}
// info window
.BMap_bubble_content{
  box-sizing: border-box;
}
// drawing
@import url("http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css");
@import url("http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css");
.BMapLib_box.BMapLib_marker{
  display: none;
}
</style>
