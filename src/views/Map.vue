<template>
  <div>
    <md-layout md-gutter>
      <md-layout md-flex-medium="100" md-flex-large="50">
        <md-card class="flex-1 m-a">
          <md-card-header>
            <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
          </md-card-header>
          <md-card-content>
            <GoogleMapTrackRender :ak="$store.state.googleMapAK" :points="points" style="width:100%;"></GoogleMapTrackRender>
          </md-card-content>
        </md-card>
      </md-layout>

      <md-layout md-flex-medium="100" md-flex-large="50">
        <md-card  class="flex-1 m-a">

            <md-card-header>
              <div class="md-title">Alert Information<fullscreen-button></fullscreen-button></div>
            </md-card-header>
            <md-card-content>
              <AlertInfomation></AlertInfomation>
            </md-card-content>

        </md-card>
      </md-layout>
    </md-layout>

    <md-card class="m-a">
      <md-card-header>
        <div class="md-title">Baidu Map<fullscreen-button></fullscreen-button></div>
      </md-card-header>
      <md-card-content>
        <!-- <BaiduMapTrackRender
        :ak="$store.state.baiduMapAK"
        :service-id="$store.state.baiduMapServiceId"
        :points="points"></BaiduMapTrackRender> -->
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import BaiduMapTrackRender from '../components/BaiduMapTrackRender.vue'
import GoogleMapTrackRender from '../components/GoogleMapTrackRender.vue'
import AlertInfomation from './AlertInfomation.vue'
export default {
  components: {
    BaiduMapTrackRender,
    GoogleMapTrackRender,
    AlertInfomation
  },
  data() {
    return {
      points: [],
    }
  },
  computed: {
    visibleRows() {
      const {rows, page, pageSize} = this.alertInfomation
      const start = (page - 1) * pageSize
      return rows.slice(start, pageSize)
    }
  },
  created() {
    // get google map points
    this.$http.get('google/23307').then(({data}) => {
      const points = data.JSON.map(point => {
        return { lat: point.location.latitude, lng: point.location.longitude }
      })
      this.points = points
    })
  }
}
</script>
