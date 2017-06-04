<template>
  <div class="baidu-map-fencing">
    <div class="baidu-map-fencing__map" :id="id"></div>
  </div>
</template>
<script>
import BaiduMapTrackRender from './BaiduMapTrackRender.vue'
//
export default {
  props: {
    // points: {}, //
    // vehicles: {},
    ak: {},
    // coordinateConversionLimit: { default: 10 },
  },
  data() {
    return {
      id: 'BaiduMapFencinge' + this._uid,
      BMapApiLoading: true,
      // don't observe
      // BMap: null,
      // map: null,
      // pathPolyline: null,
      // BMapPoints: null,
    }
  },
  watch: {
//     points: {
//       immediate: true,
//       handler(points) {
//         // clear overlays
//         this.map && this.map.clearOverlays()
//         //
//         if (points && points.length > 0) {
//           this.mapReady().then(({BMap, map}) => {
//             // convertPoints
//             this.convertPoints(points, BMap).then((data) => {
//               const bmPoints = this.BMapPoints = data.points
//               if (!this._autoCenterAndZoomed) {
//                 this._autoCenterAndZoomed = true
//                 this.autoCenterAndZoom(map, bmPoints, BMap)
//               }
//               //
//               const BMapIconOnline = new BMap.Icon(onlineIcon, new BMap.Size(46, 46), {
//                 anchor: new BMap.Size(23, 46),
//               })
//               const BMapIconOffline = new BMap.Icon(offlineIcon, new BMap.Size(46, 46), {
//                 anchor: new BMap.Size(23, 46),
//               })
//               bmPoints.forEach((bmPoint, index) => {
//                 const point = points[index] // origin point data
//                 const marker = new BMap.Marker(bmPoint, {icon: point.online ? BMapIconOnline : BMapIconOffline})
//                 map.addOverlay(marker)
//                 const infoWindow = new BMap.InfoWindow(`
// <div class="text-center">
// ${this.getVrmMarkCodeByID(point.vrm_id)}
// </div>`,
//                   {
//                     width: 60,
//                     height: 30,
//                   }
//                 )
//                 marker.addEventListener('click', () => {
//                   map.openInfoWindow(infoWindow, bmPoint)
//                 })
//               })
//             })
//           })
//         }
//       }
//     }
  },
  methods: {
    autoCenterAndZoom(...args) { BaiduMapTrackRender.methods.autoCenterAndZoom.apply(this, args) },
    mapReady() { return BaiduMapTrackRender.methods.mapReady.apply(this) },
    checkSize() { BaiduMapTrackRender.methods.checkSize.apply(this) },
    // getVrmMarkCodeByID(vrmId) {
    //   const found = this.vehicles && this.vehicles.find(p => p.vrm_id === vrmId)
    //   return found && found.vrm_mark_code
    // },
    // convertPoints(points, BMap) {
    //   const convertor = new BMap.Convertor()
    //   //
    //   const converted = this.convertedPoints
    //   const resultPoints = []
    //   const inConverted = []
    //   const inConvertedIndexes = []
    //   points.forEach((p, index) => {
    //     const key = JSON.stringify(p)
    //     if (converted[key]) {
    //       resultPoints[index] = new BMap.Point(converted[key].lng, converted[key].lat)
    //     } else {
    //       inConverted.push(p)
    //       inConvertedIndexes.push(index)
    //     }
    //   })
    //   const BMapPoints = inConverted.map(point => new BMap.Point(point.lng, point.lat))
    //   //
    //   const promises = []
    //   const n = this.coordinateConversionLimit
    //   while (BMapPoints.length > 0) {
    //     promises.push(new Promise((resolve, reject) => {
    //       convertor.translate(BMapPoints.splice(0, n), 1, 5, (data) => { resolve(data) })
    //     }))
    //   }
    //   return Promise.all(promises).then((datas) => {
    //     let i = 0
    //     for (const data of datas) {
    //       for (const point of data.points) {
    //         const index = inConvertedIndexes[i]
    //         resultPoints[index] = point
    //         converted[JSON.stringify(inConverted[i])] = inConverted[i]
    //         i++
    //       }
    //     }
    //     return { points: resultPoints, dataArr: datas }
    //   })
    // },
  },
  created() {
    // // don't observe
    // this.convertedPoints = {}
    //
    this.mapReady().then(({BMap, map}) => {
      this.BMap = BMap
      this.BMapApiLoading = false
      //
      map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)
	    map.enableScrollWheelZoom()
      map.clearOverlays()
      const polygon = new BMap.Polygon([
        new BMap.Point(116.387112, 39.920977),
        new BMap.Point(116.385243, 39.913063),
        new BMap.Point(116.394226, 39.917988),
        new BMap.Point(116.401772, 39.921364),
        new BMap.Point(116.41248, 39.927893),
    	], {strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5})  //
      polygon.enableEditing()
    	map.addOverlay(polygon)   //
    })
    window.addEventListener('resize', this.checkSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkSize)
  }
}

</script>

<style lang="scss">
.baidu-map-fencing{
  width: 100%;
  height:100%;
  min-height: 50px;
  /* prevent other css effect baidumap overlay */
  svg{
    max-width: inherit;
  }
}
.baidu-map-fencing__map{
  width: 100%;
  height: 100%;
}
</style>
