<template>
  <div class="google-map-track-render">
    <div class="google-map-track-render__map" :id="id"></div>
  </div>
</template>
<script>
import {arrayLast} from 'helper-js'
import runtime from '@/runtime.js'
import { googleMapReady as mapReady } from '@/utils.js'

export default {
  props: {
    points: {}, //
    ak: {},
  },
  data() {
    return {
      id: 'GoogleMapTrackRender' + this._uid,
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
            this.autoCenterAndZoom(map, points, google)
            //
            const startPoint = new google.maps.Marker({
              position: points[0],
              label: 'A'
            })
            overLays.push(startPoint)
            // track
            const pathPolyline = new google.maps.Polyline({
              path: points,
              geodesic: true,
              strokeColor: '#FF0000',
              strokeOpacity: 1.0,
              strokeWeight: 3,
            })
            overLays.push(pathPolyline)
            //
            const endPoint = new google.maps.Marker({
              position: arrayLast(points),
              label: 'B'
            })
            overLays.push(endPoint)
            //
            overLays.forEach(v => { v.setMap(map) })
          })
        }
      }
    }
  },
  methods: {
    autoCenterAndZoom(map, points, google) {
      const bounds = new google.maps.LatLngBounds()
      let minLat = points[0].lat
      let maxLat = points[0].lat
      let minLng = points[0].lng
      let maxLng = points[0].lng
      points.forEach(point => {
        if (point.lat < minLat) {
          minLat = point.lat
        } else if (point.lat > maxLat) {
          maxLat = point.lat
        }
        if (point.lng < minLng) {
          minLng = point.lng
        } else if (point.lng > maxLng) {
          maxLng = point.lng
        }
      })
      const loc1 = new google.maps.LatLng(minLat, minLng)
      const loc2 = new google.maps.LatLng(maxLat, maxLng)
      bounds.extend(loc1)
      bounds.extend(loc2)
      map.fitBounds(bounds)
      map.panToBounds(bounds)
    },
    mapReady,
    checkSize() {
      this.$nextTick(() => {
        if (this.google && this.google.maps && this.map) {
          this.google.maps.event.trigger(this.map, 'resize')
        }
      })
    }
  },
  created() {
    // don't observe
    Object.assign(this, {
      google: null,
      map: null,
      pathPolyline: null,
    })
    this.overLays = this.overLays || []
    this.mapReady().then(({google, map}) => {
      this.google = google
      this.googleApiLoading = false
    })
    runtime.gmtr = this
  }
}
</script>
<style>
.google-map-track-render{
  width: 100%;
  height:100%;
  min-height: 50px;
}
.google-map-track-render__map{
  width: 100%;
  height: 100%;
}
</style>
