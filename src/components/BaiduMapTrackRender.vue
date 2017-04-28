<script>
import BaiduMapTrackRender from 'baidu-map-track-render-vue/src/BaiduMapTrackRender.vue'
export default {
  extends: BaiduMapTrackRender,
  props: {
    points: {},
    ak: {},
    snap: { default: true }, // snap to roads
    serviceId: {},
  },
  methods: {
    // overide
    ready(BMap, points) {
      this.addEntity('develope')
      return
      this.convertPoints(points, BMap).then(({points}) => {
        var map = new BMap.Map(this.id)
        var center = this.getCenter(points, BMap)
        map.centerAndZoom(center, 15)
        map.enableScrollWheelZoom()

        for (let i = 0; i < points.length; i++) {
          const prev = points[i - 1]
          if (prev) {
            const current = points[i]
            const polyline = new BMap.Polyline([
              prev,
              current,
            ], {strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5})   // 创建折线
            map.addOverlay(polyline)   // 增加折线
          }
        }
      })
    },
    addEntity(name) {
      return this.$http.post('https://yingyan.baidu.com/api/v3/entity/add', {
        ak: this.ak,
        service_id: this.serviceId,
        entity_name: name
      }).then(({data}) => data)
    },
  }
}
</script>
