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
import { format } from 'date-functions'
import { googleMapReady as mapReady } from '@/utils.js'
//
export default {
  props: {
    points: {}, //
    vehicles: {}, //
    ak: {},
  },
  data() {
    return {
      id: 'GoogleMapRealTime' + this._uid,
      googleApiLoading: true,
    }
  },
  watch: {
    points: {
      immediate: true,
      handler(points) {
        // clear overlays
        this.overLays = this.overLays || []
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
              const detail = this.getPointByID(point.vrm_id) || {}
              const infowindow = new google.maps.InfoWindow({
                content: `
<div class="text-center" style="font-size:14px;line-height:30px;">
${this.getVrmMarkCodeByID(point.vrm_id)}<br />
Last active: ${format(new Date(detail.last_loc_update_ts))}
</div>`,
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
    mapReady,
    checkSize() { GoogleMapTrackRender.methods.checkSize.apply(this) },
    getVrmMarkCodeByID(vrmId) {
      const found = this.vehicles && this.vehicles.find(p => p.vrm_id === vrmId)
      return found && found.vrm_mark_code
    },
    getPointByID(vrmId) {
      return this.points && this.points.find(p => p.vrm_id === vrmId)
    },
  },
  created() {
    // don't observe
    this.google = null
    this.map = null
    this.overLays = this.overLays || []
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
