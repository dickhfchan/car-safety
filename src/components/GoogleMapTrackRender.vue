<template>
  <div class="google-map-track-render">
    <div class="google-map-track-render__map" :id="id"></div>
  </div>
</template>
<script>
import {windowLoaded, unset} from 'helper-js'
//
function loadGoogleMap(ak) {
  if (window.google && window.google.map) {
    return Promise.resolve(window.google.map)
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
    ak: {}
  },
  data() {
    return {
      id: 'GoogleMapTrackRender' + this._uid
    }
  },
  mounted() {
    this.$nextTick(() => {
      loadGoogleMap(this.ak).then((google) => {
        const points = this.points
        if (points) {
          var map = new google.maps.Map(document.getElementById(this.id), {
            zoom: 14,
            center: this.getCenter(points),
            mapTypeId: 'terrain'
          })
          const pathPolyline = new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          })

          pathPolyline.setMap(map)
        }
      })
    })
  },
  methods: {
    getCenter(points) {
      let maxX = points[0].lng
      let maxY = points[0].lat
      let minX = points[0].lng
      let minY = points[0].lat
      for (const p of points) {
        if (p.lng < minX) {
          minX = p.lng
        }
        if (p.lng > maxX) {
          maxX = p.lng
        }
        if (p.lat < minY) {
          minY = p.lat
        }
        if (p.lat > maxY) {
          maxY = p.lat
        }
      }
      return {lat: (maxY + minY) / 2, lng: (maxX + minX) / 2}
    },
  }
}
</script>
<style>
.google-map-track-render{
  width: 680px;
  height: 480px;
}
.google-map-track-render__map{
  width: 100%;
  height: 100%;
}
</style>
