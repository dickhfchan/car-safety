<template>
  <div class="google-map-real-time">
    <div class="google-map-real-time__map" :id="id"></div>
  </div>
</template>
<script>
import runtime from '@/runtime.js'
import GoogleMapTrackRender from './GoogleMapTrackRender.vue'
import onlineIcon from '@/assets/img/map/ONline.png'
import offlineIcon from '@/assets/img/map/OFFline.png'
//
export default {
  props: {
    points: {}, //
    ak: {},
  },
  data() {
    return {
      id: 'GoogleMapRealTime' + this._uid,
      google: null,
      map: null,
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
            if (!this._autoCenterAndZoomed) {
              this._autoCenterAndZoomed = true
              this.autoCenterAndZoom(map, points, google)
            }
            //
            // track
            let prevOpenedInfoWindow
            points.forEach(point => {
              const marker = new google.maps.Marker({
                position: point,
                icon: point.online ? onlineIcon : offlineIcon
              })
              overLays.push(marker)
              const infowindow = new google.maps.InfoWindow({
                content: `
<pre>
${point.vrm_id}
</pre>`
              })
              marker.addListener('click', () => {
                if (prevOpenedInfoWindow) {
                  prevOpenedInfoWindow.close()
                }
                prevOpenedInfoWindow = infowindow
                infowindow.open(map, marker)
              })
            })
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
