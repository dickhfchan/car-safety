<template>
  <div class="baidu-map-fencing">
    <div class="baidu-map-fencing__map" :id="id"></div>
    <Map-Drawing-Tools ref="tools" class="baidu-map-fencing-drawing-tools" v-show="toolsReady"></Map-Drawing-Tools>
  </div>
</template>
<script>
import BaiduMapTrackRender from './BaiduMapTrackRender.vue'
import MapDrawingTools from './MapDrawingTools.vue'
import $script from 'scriptjs'
//
export default {
  components: { MapDrawingTools },
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
      toolsReady: false,
      // don't observe
      // BMap: null,
      // map: null,
      // pathPolyline: null,
      // BMapPoints: null,
      // drawingManager
      // fence
    }
  },
  watch: {
  },
  created() {
    // // don't observe
    // this.convertedPoints = {}
    this.styleOptions = {
      strokeColor: 'blue',    // 边线颜色。
      fillColor: 'blue',      // 填充颜色。当参数为空时，圆形将没有填充效果。
      strokeWeight: 3,       // 边线的宽度，以像素为单位。
      strokeOpacity: 0.8,     // 边线透明度，取值范围0 - 1。
      fillOpacity: 0.6,      // 填充的透明度，取值范围0 - 1。
      strokeStyle: 'solid' // 边线的样式，solid或dashed。
    }
    //
    this.mapReady().then(({BMap, map}) => {
      $script([
        'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js',
        'http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js',
        'http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils.js',
      ],
      () => {
        this.toolsReady = true
        const DrawingManager = window.BMapLib.DrawingManager
        this.BMap = BMap
        this.BMapApiLoading = false
          //
        map.clearOverlays()
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)
        map.enableScrollWheelZoom()
        this.renderSaved()
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
        const { styleOptions } = this
       // 实例化鼠标绘制工具
        const drawingManager = this.drawingManager = new DrawingManager(map, {
          isOpen: false, // 是否开启绘制模式
          enableDrawingTool: false, // 是否显示工具栏
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
        drawingManager.addEventListener('overlaycomplete', (e) => {
          this.map.removeOverlay(this.fence)
          this.fence = e.overlay
          this.save()
          this.initFence()
        })
        drawingManager.addEventListener('polygoncomplete', (e) => {
          this.$refs.tools.selectedKey = 'drag'
        })
      })
    })
    window.addEventListener('resize', this.checkSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkSize)
  },
  methods: {
    autoCenterAndZoom(...args) { BaiduMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady() { return BaiduMapTrackRender.methods.mapReady.apply(this) },
    checkSize() { BaiduMapTrackRender.methods.checkSize.apply(this) },
    removeFence() { this.map.removeOverlay(this.fence) },
    save() {
      const fence = this.fence
      const temp = {}
      if (fence.hasOwnProperty('xa')) {
        // circle
        temp.type = 'circle'
        temp.xa = fence.xa
        temp.point = { lat: fence.point.lat, lng: fence.point.lng }
      } else {
        temp.type = 'polygon'
        temp.points = fence.po.map(p => { return { lat: p.lat, lng: p.lng } })
      }
      window.localStorage.setItem('fence', JSON.stringify(temp))
    },
    renderSaved() {
      const temp = window.localStorage.getItem('fence')
      const fence = temp && JSON.parse(temp)
      if (fence) {
        const { BMap } = window
        const { map } = this
        let points
        if (fence.type === 'circle') {
          const center = new BMap.Point(fence.point.lng, fence.point.lat)
          this.fence = new BMap.Circle(center, fence.xa, this.styleOptions)
          const xa2 = fence.xa / 100000
          points = [new BMap.Point(center.lng - xa2, center.lat - xa2), new BMap.Point(center.lng + xa2, center.lat + xa2)]
        } else {
          points = fence.points.map(p => new BMap.Point(p.lng, p.lat))
          this.fence = new BMap.Polygon(points, this.styleOptions)
        }
        map.addOverlay(this.fence)
        this.initFence()
        map.setViewport(points, { enableAnimation: false })
      }
    },
    initFence() {
      this.fence.enableEditing()
      this.fence.addEventListener('lineupdate', (e) => {
        this.save()
      })
    },
    isInFence(lng, lat) {
      const { fence } = this
      const { BMap, BMapLib } = window
      const pt = new BMap.Point(lng, lat)
      let result
      if (fence && fence.hasOwnProperty('xa')) {
        result = BMapLib.GeoUtils.isPointInCircle(pt, fence)
      } else {
        const bds = new BMap.Bounds(...fence.po)
        result = BMapLib.GeoUtils.isPointInRect(pt, bds)
      }
      window.alert(`The point is ${result ? 'in' : 'out of'} map`)
    },
  },
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
// @import url("http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css");
// @import url("http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css");
// .BMapLib_box.BMapLib_marker{
//   display: none;
// }
.baidu-map-fencing-drawing-tools{
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
