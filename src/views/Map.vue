<template>
  <div class="p-a">
    <md-card>
      <md-card-header>
        <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
      </md-card-header>

      <md-card-content>
        <GoogleMapTrackRender :ak="$store.state.googleMapAK" :points="points" style="width:100%;"></GoogleMapTrackRender>
        <md-toolbar md-theme="green" style="color: #fff;min-height: inherit;padding: .5em 8px;">
          <h1 class="md-title">Alert Information</h1>
        </md-toolbar>
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

    <md-card class="m-t">
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
