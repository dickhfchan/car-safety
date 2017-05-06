<template>
  <div class="google-map-track-render">
    <div class="google-map-track-render__map" :id="id"></div>
  </div>
</template>
<script>
import {windowLoaded, unset} from 'helper-js'
//
function loadGoogleMap(ak) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google)
  }
  const fun = loadGoogleMap
  return windowLoaded().then(() => {
    if (fun.loaded) {
      return window.google
    } else if (!fun.requested) {
      fun.requested = true
      window._GoogleMapLoadedCallback = () => { fun.loaded = true; unset(window, '_GoogleMapLoadedCallback') }
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${ak}&callback=_GoogleMapLoadedCallback`
      document.body.appendChild(script)
      return new Promise(function(resolve, reject) {
        const requestInterval = window.setInterval(function () {
          if (fun.loaded) {
            window.clearInterval(requestInterval)
            resolve(window.google)
          }
        }, 10)
      })
    }
  })
}

export default {
  props: {
    points: {}, //
    ak: {},
  },
  data() {
    return {
      id: 'GoogleMapTrackRender' + this._uid,
      google: null,
      map: null,
      pathPolyline: null,
      googleApiLoading: true,
    }
  },
  watch: {
    points: {
      immediate: true,
      handler(points) {
        if (this.pathPolyline) {
          this.pathPolyline.setMap(null)
          this.pathPolyline = null
        }
        if (points && points.length > 0) {
          this.mapReady().then(({google, map}) => {
            this.autoCenterAndZoom(map, points, google)
            this.pathPolyline = new google.maps.Polyline({
              path: points,
              geodesic: true,
              strokeColor: '#2196f3',
              strokeOpacity: 1.0,
              strokeWeight: 3
            })
            this.pathPolyline.setMap(map)
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
    mapReady() {
      return loadGoogleMap(this.ak).then(google => {
        if (!this.map) {
          this.map = new google.maps.Map(document.getElementById(this.id), {
            center: this.$store.state.initialPoint,
            zoom: 15,
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            mapTypeControlOptions: {
              mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.SATELLITE
              ]
            }
          })
        }
        return Promise.resolve({google, map: this.map})
      })
    },
    checkSize() {
      if (this.google && this.google.maps && this.map) {
        this.google.maps.event.trigger(this.map, 'resize')
      }
    }
  },
  created() {
    this.mapReady().then(({google, map}) => {
      this.google = google
      this.googleApiLoading = false
    })
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
