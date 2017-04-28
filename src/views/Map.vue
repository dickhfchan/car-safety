<template>
  <md-layout md-gutter>
    <md-layout md-flex>
      <md-card style="flex:1">
        <md-card-header>
          <div class="md-title">Baidu Map</div>
        </md-card-header>
        <md-card-content>
          <!-- <BaiduMapTrackRender :ak="$store.state.baiduMapAK" :points="points"></BaiduMapTrackRender> -->
        </md-card-content>
      </md-card>
    </md-layout>

    <md-layout md-flex>
      <md-card style="flex:1">
        <md-card-header>
          <div class="md-title">Google Map</div>
        </md-card-header>
        <md-card-content>
          <GoogleMapTrackRender :ak="$store.state.googleMapAK" :points="points"></GoogleMapTrackRender>
        </md-card-content>
      </md-card>
    </md-layout>
  </md-layout>
</template>

<script>
import BaiduMapTrackRender from 'baidu-map-track-render-vue/src/BaiduMapTrackRender.vue'
import GoogleMapTrackRender from '../components/GoogleMapTrackRender.vue'
import examplePoints from '../example-data/points.js'
export default {
  components: {
    BaiduMapTrackRender,
    GoogleMapTrackRender
  },
  data() {
    return {
      points: examplePoints.filter(p => p.lat && p.lng).map(p => {
        return { lat: parseFloat(p.lat), lng: parseFloat(p.lng) }
      })
    }
  }
}
</script>

<style scoped>
.md-card{
  margin: 1em;
}
</style>
