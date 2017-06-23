<template>
  <div class="baidu-map-real-time">
    <div class="baidu-map-real-time__map" :id="id"></div>
  </div>
</template>
<script>
import runtime from '@/runtime.js'
import BaiduMapTrackRender from './BaiduMapTrackRender.vue'
import onlineIcon from '@/assets/img/map/ONline.png'
import offlineIcon from '@/assets/img/map/OFFline.png'
import { format } from 'date-functions'
import { baiduMapReady as mapReady } from '@/utils.js'
//
export default {
  props: {
    points: {}, //
    vehicles: {},
    ak: {},
    coordinateConversionLimit: { default: 10 },
  },
  data() {
    return {
      id: 'BaiduMapRealTime' + this._uid,
      BMapApiLoading: true,
      // don't observe
      // BMap: null,
      // map: null,
      // pathPolyline: null,
      // BMapPoints: null,
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
            // convertPoints
            this.convertPoints(points, BMap).then((data) => {
              const bmPoints = this.BMapPoints = data.points
              if (!this._autoCenterAndZoomed) {
                this._autoCenterAndZoomed = true
                this.autoCenterAndZoom(map, bmPoints, BMap)
              }
              //
              const BMapIconOnline = new BMap.Icon(onlineIcon, new BMap.Size(46, 46), {
                anchor: new BMap.Size(23, 46),
              })
              const BMapIconOffline = new BMap.Icon(offlineIcon, new BMap.Size(46, 46), {
                anchor: new BMap.Size(23, 46),
              })
              bmPoints.forEach((bmPoint, index) => {
                const point = points[index] // origin point data
                const marker = new BMap.Marker(bmPoint, {icon: point.online ? BMapIconOnline : BMapIconOffline})
                map.addOverlay(marker)
                const detail = this.getPointByID(point.vrm_id) || {}
                const infoWindow = new BMap.InfoWindow(`
<div class="text-center">
${this.getVrmMarkCodeByID(point.vrm_id)}<br />
Last active: ${format(new Date(detail.last_loc_update_ts))}
</div>`,
                  {
                    width: 60,
                    height: 30,
                    offset: new BMap.Size(0, -46)
                  }
                )
                marker.addEventListener('click', () => {
                  map.openInfoWindow(infoWindow, bmPoint)
                })
              })
            })
          })
        }
      }
    }
  },
  methods: {
    autoCenterAndZoom(...args) { BaiduMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady,
    checkSize() { BaiduMapTrackRender.methods.checkSize.apply(this) },
    getVrmMarkCodeByID(vrmId) {
      const found = this.vehicles && this.vehicles.find(p => p.vrm_id === vrmId)
      return found && found.vrm_mark_code
    },
    getPointByID(vrmId) {
      return this.points && this.points.find(p => p.vrm_id === vrmId)
    },
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
    // don't observe
    this.convertedPoints = {}
    //
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
