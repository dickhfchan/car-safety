<template>
  <div class="google-map-track-render">
    <div class="google-map-track-render__map" :id="id"></div>
  </div>
</template>
<script>
import {windowLoaded, unset} from 'helper-js'
import axios from 'axios'
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
    snap: { default: true }, // snap to roads
  },
  data() {
    return {
      id: 'GoogleMapTrackRender' + this._uid
    }
  },
  mounted() {
    this.$nextTick(() => {
      loadGoogleMap(this.ak)
      // 1 point at least
      .then((google) => {
        if (this.points && this.points.length > 0) {
          return {google, points: this.points}
        } else {
          return Promise.reject(new Error('no point'))
        }
      })
      // convert points to snappedPoints
      .then(({google, points}) => {
        if (this.snap) {
          const clonedPoints = points.slice(0)
          const n = 100 // coordinate to snapped points limit
          const promises = []
          while (clonedPoints.length > 0) {
            const pointsSlice = clonedPoints.splice(0, n)
            const path = pointsSlice.map(p => `${p.lat},${p.lng}`).join('|')
            const url = `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=true&key=${this.ak}`
            promises.push(axios.get(url).then((response) => {
              const points = response.data.snappedPoints.map(p => {
                return { lng: p.location.longitude, lat: p.location.latitude }
              })
              return {response, points}
            }))
          }
          return Promise.all(promises).then((datas) => {
            const resultPoints = []
            for (const data of datas) {
              for (const point of data.points) {
                resultPoints.push(point)
              }
            }
            return { google, points: resultPoints, dataArr: datas }
          })
        } else {
          return {google, points: this.points}
        }
      })
      // init map and render track
      .then(({google, points}) => {
        const map = new google.maps.Map(document.getElementById(this.id), {
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
