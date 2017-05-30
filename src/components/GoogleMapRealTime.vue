<template>
  <div class="google-map-real-time">
    <div class="google-map-real-time__map" :id="id"></div>
  </div>
</template>
<script>
import runtime from '@/runtime.js'
import GoogleMapTrackRender from './GoogleMapTrackRender.vue'
//
export default {
  props: {
    points: {}, //
    ak: {},
    activeColor: {},
    expiredColor: {}
  },
  data() {
    return {
      id: 'GoogleMapRealTime' + this._uid,
      google: null,
      map: null,
      pathPolyline: null,
      googleApiLoading: true,
      overLays: [],
    }
  },
  watch: {
    points: {
      immediate: true,
      handler(points) {
        // clear overlays
        const overLays = this.overLays
        overLays.forEach(v => { v.setMap(null) })
        overLays.length = 0
        //
        if (points && points.length > 0) {
          this.mapReady().then(({google, map}) => {
            this.autoCenterAndZoom(map, points, google)
            //
            const latestPoint = new google.maps.Marker({
              position: points[0],
              // label: 'A'
            })
            overLays.push(latestPoint)
            // track
            const expiredPoints = []
            const activePoints = []
            points.forEach(p => {
              if (p.expired) {
                expiredPoints.push(p)
              } else {
                activePoints.push(p)
              }
            })
            const expiredPathPolyline = new google.maps.Polyline({
              path: expiredPoints,
              geodesic: true,
              strokeColor: this.expiredColor,
              strokeOpacity: 1.0,
              strokeWeight: 3,
            })
            overLays.push(expiredPathPolyline)
            const activePathPolyline = new google.maps.Polyline({
              path: activePoints,
              geodesic: true,
              strokeColor: this.activeColor,
              strokeOpacity: 1.0,
              strokeWeight: 3,
            })
            overLays.push(activePathPolyline)
            //
            overLays.forEach(v => { v.setMap(map) })
          })
        }
      }
    }
  },
  methods: {
    autoCenterAndZoom(...args) { GoogleMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady() { return GoogleMapTrackRender.methods.mapReady.apply(this) },
    checkSize() { GoogleMapTrackRender.methods.checkSize.apply(this) },
  },
  created() {
    this.mapReady().then(({google, map}) => {
      this.google = google
      this.googleApiLoading = false
    })
    runtime.gmrt = this
  }
}
</script>
<style>
.google-map-real-time{
  width: 100%;
  height:100%;
  min-height: 50px;
}
.google-map-real-time__map{
  width: 100%;
  height: 100%;
}
</style>
