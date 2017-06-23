<template>
  <div class="baidu-map-track-render">
    <div class="baidu-map-track-render__map" :id="id"></div>
  </div>
</template>
<script>
import {arrayLast} from 'helper-js'
import runtime from '@/runtime.js'
import mapIcons from '../map-icons.js'
import { baiduMapReady as mapReady } from '@/utils.js'
//

export default {
  props: {
    points: {}, //
    ak: {},
  },
  data() {
    return {
      id: 'BaiduMapTrackRender' + this._uid,
      BMapApiLoading: true,
      // don't observe
      // BMap: null,
      // map: null,
      // pathPolyline: null,
      // BMapPoints: null
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
          // !!disabled pick one point out of 10 if distance more than 100km
          // const trip = this.$store.state.trips.find(item => item.veh_trip_id === this.$store.state.tripId)
          // if (trip && trip.drv_distance / 100000 > 100) {
          //   points = points.filter((p, i) => i % 10 === 0)
          // }
          this.mapReady().then(({BMap, map}) => {
            points = points.map(p => new BMap.Point(p.lng, p.lat))
            this.BMapPoints = points
            this.autoCenterAndZoom(map, points, BMap)
            //
            let icon, BMapIcon
            //
            icon = mapIcons.start
            BMapIcon = new BMap.Icon(icon, new BMap.Size(26, 26), {
              anchor: new BMap.Size(13, 26),
            })
            const startPoint = new BMap.Marker(points[0], {icon: BMapIcon})
            map.addOverlay(startPoint)
            // track
            const pathPolyline = new BMap.Polyline(
              points,
              {strokeColor: '#FF0000', strokeWeight: 3, strokeOpacity: 1.0}
            )
            map.addOverlay(pathPolyline)
            //
            icon = mapIcons.end
            BMapIcon = new BMap.Icon(icon, new BMap.Size(26, 26), {
              anchor: new BMap.Size(13, 26),
            })
            const lastPoint = arrayLast(points)
            const endPoint = new BMap.Marker(lastPoint, {icon: BMapIcon})
            map.addOverlay(endPoint)
            //
          })
        }
      }
    }
  },
  methods: {
    autoCenterAndZoom(map, points, BMap) {
      map.setViewport(points)
    },
    mapReady,
    checkSize() {
      this.$nextTick(() => {
        if (this.BMap && this.map && this.map) {
          this.autoCenterAndZoom(this.map, this.BMapPoints, this.BMap)
        }
      })
    }
  },
  created() {
    this.mapReady().then(({BMap, map}) => {
      this.BMap = BMap
      this.BMapApiLoading = false
    })
    runtime.bmtr = this
    window.addEventListener('resize', this.checkSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkSize)
  }
}

</script>

<style lang="scss">
.baidu-map-track-render{
  width: 100%;
  height:100%;
  min-height: 50px;
  /* prevent other css effect baidumap overlay */
  svg{
    max-width: inherit;
  }
}
.baidu-map-track-render__map{
  width: 100%;
  height: 100%;
}
</style>
