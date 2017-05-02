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

      <md-layout  md-flex-medium="100" md-flex-large="50">
        <md-card  class="flex-1 m-a">
          <md-card-header>
            <div class="md-title">Alert Information<fullscreen-button></fullscreen-button></div>
          </md-card-header>
          <md-card-content>
            <md-table v-once>
              <md-table-header>
                <md-table-row>
                  <md-table-head>Warning</md-table-head>
                  <md-table-head>Start Time</md-table-head>
                  <md-table-head>End Time</md-table-head>
                  <md-table-head>Duration</md-table-head>
                  <md-table-head>Latitude</md-table-head>
                  <md-table-head>Longitude</md-table-head>
                  <md-table-head>Start Speed</md-table-head>
                  <md-table-head>End Speed</md-table-head>
                  <md-table-head>Top Speed</md-table-head>
                  <md-table-head>TI</md-table-head>
                  <md-table-head>HW</md-table-head>
                  <md-table-head>Near HW</md-table-head>
                  <md-table-head>SS</md-table-head>
                  <md-table-head>SX</md-table-head>
                </md-table-row>
              </md-table-header>

              <md-table-body>
                <md-table-row v-for="(row, index) in 11" :key="index">
                  <md-table-cell v-for="(col, index) in 14" :key="index">10</md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>
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
import points2 from '../example-data/points2.js'
// import axios from 'axios'
export default {
  components: {
    BaiduMapTrackRender,
    GoogleMapTrackRender
  },
  data() {
    return {
      // ormat them to {lat, lng}
      points: []
    }
  },
  created() {
    // axios.get('http://54.255.227.246:5000/api/382')
    // simulation
    setTimeout(() => {
      this.points = points2.results.map(point => {
        return { lat: point.location.latitude, lng: point.location.longitude }
      })
    }, 300)
  }
}
</script>
