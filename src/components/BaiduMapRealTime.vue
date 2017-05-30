<template>
  <div class="baidu-map-real-time">
    <div class="baidu-map-real-time__map" :id="id"></div>
  </div>
</template>
<script>
import runtime from '@/runtime.js'
import BaiduMapTrackRender from './BaiduMapTrackRender.vue'
import mapMarkerIcon from '@/assets/img/map/map-marker.png'
//
export default {
  props: {
    points: {}, //
    ak: {},
    activeColor: {},
    expiredColor: {},
    coordinateConversionLimit: { default: 10 },
  },
  data() {
    return {
      id: 'BaiduMapRealTime' + this._uid,
      BMap: null,
      map: null,
      pathPolyline: null,
      BMapApiLoading: true,
      BMapPoints: null,
      convertedPoints: {},
    }
  },
  watch: {
    points: {
      immediate: true,
      handler(points) {
        // clear overlays
        this.map && this.map.clearOverlays()
        //
        if (points && points.length > 0) {
          this.mapReady().then(({BMap, map}) => {
            const activePoints = []
            const expiredPoints = []
            points.forEach(p => {
              if (p.expired) {
                expiredPoints.push(p)
              } else {
                activePoints.push(p)
              }
            })
            // convertPoints
            Promise.all([
              this.convertPoints(activePoints, BMap),
              this.convertPoints(expiredPoints, BMap),
            ]).then((arr) => {
              const activePoints = arr[0].points
              const expiredPoints = arr[1].points
              const allBMapPoints = activePoints.concat(expiredPoints)
              this.BMapPoints = allBMapPoints
              if (!this._autoCenterAndZoomed) {
                this._autoCenterAndZoomed = true
                this.autoCenterAndZoom(map, allBMapPoints, BMap)
              }
              //
              const BMapIcon = new BMap.Icon(mapMarkerIcon, new BMap.Size(26, 26), {
                anchor: new BMap.Size(13, 26),
              })
              const latestPoint = new BMap.Marker(allBMapPoints[0], {icon: BMapIcon})
              map.addOverlay(latestPoint)
              // track
              const activePathPolyline = new BMap.Polyline(
                activePoints,
                {strokeColor: this.activeColor, strokeWeight: 3, strokeOpacity: 1.0}
              )
              map.addOverlay(activePathPolyline)
              const expiredPathPolyline = new BMap.Polyline(
                expiredPoints,
                {strokeColor: this.expiredColor, strokeWeight: 3, strokeOpacity: 1.0}
              )
              map.addOverlay(expiredPathPolyline)
            })
          })
        }
      }
    }
  },
  methods: {
    autoCenterAndZoom(...args) { BaiduMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady() { return BaiduMapTrackRender.methods.mapReady.apply(this) },
    checkSize() { BaiduMapTrackRender.methods.checkSize.apply(this) },
    convertPoints(points, BMap) {
      const convertor = new BMap.Convertor()
      //
      const converted = this.convertedPoints
      const resultPoints = []
      const inConverted = []
      const inConvertedIndexes = []
      points.forEach((p, index) => {
        const key = JSON.stringify(p)
        if (converted[key]) {
          resultPoints[index] = new BMap.Point(converted[key].lng, converted[key].lat)
        } else {
          inConverted.push(p)
          inConvertedIndexes.push(index)
        }
      })
      const BMapPoints = inConverted.map(point => new BMap.Point(point.lng, point.lat))
      //
      const promises = []
      const n = this.coordinateConversionLimit
      while (BMapPoints.length > 0) {
        promises.push(new Promise((resolve, reject) => {
          convertor.translate(BMapPoints.splice(0, n), 1, 5, (data) => { resolve(data) })
        }))
      }
      return Promise.all(promises).then((datas) => {
        let i = 0
        for (const data of datas) {
          for (const point of data.points) {
            const index = inConvertedIndexes[i]
            resultPoints[index] = point
            converted[JSON.stringify(inConverted[i])] = inConverted[i]
            i++
          }
        }
        return { points: resultPoints, dataArr: datas }
      })
    },
  },
  created() {
    this.mapReady().then(({BMap, map}) => {
      this.BMap = BMap
      this.BMapApiLoading = false
    })
    runtime.bmrt = this
    window.addEventListener('resize', this.checkSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkSize)
  }
}

</script>

<style lang="scss">
.baidu-map-real-time{
  width: 100%;
  height:100%;
  min-height: 50px;
  /* prevent other css effect baidumap overlay */
  svg{
    max-width: inherit;
  }
}
.baidu-map-real-time__map{
  width: 100%;
  height: 100%;
}
</style>
