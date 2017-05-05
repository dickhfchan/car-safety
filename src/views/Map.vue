<template>
  <div>
    <md-layout md-gutter>
      <md-layout md-flex-medium="100" md-flex-large="50">
        <div class="flex-1 m-a">
          <md-card>
            <md-card-header>
              <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
            </md-card-header>
            <md-card-content class="flex">
                <GoogleMapTrackRender :ak="$store.state.googleMapAK" :points="points" style="width:100%;"></GoogleMapTrackRender>

                <div class="trips m-l">
                  <h4 class="md-title">Trips</h4>
                  <md-list class="trips-list md-triple-line">
                    <md-list-item v-for="n in 10">
                     <md-avatar>
                       <img src="https://placeimg.com/40/40/people/1" alt="People">
                     </md-avatar>

                     <div class="md-list-text-container">
                       <span>Trip{{n}}</span>
                       <span>Brunch this weekend?</span>
                       <p>I'll be in your neighborhood doing errands...</p>
                     </div>

                     <md-divider class="md-inset"></md-divider>
                   </md-list-item>
                  </md-list>
                </div>

            </md-card-content>
          </md-card>
        </div>
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
    // this.$http.get('google/23307').then(({data}) => {
    //   this.points = data.JSON
    // })
    this.points = [{
      'google_snap_gsp_id': 1,
      'lat': 22.389240658424196,
      'lng': 114.20971792960539,
      'originalIndex': 0,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 2,
      'lat': 22.389261539907558,
      'lng': 114.20969181909852,
      'originalIndex': 1,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 3,
      'lat': 22.389276641572692,
      'lng': 114.20967293575126,
      'originalIndex': 2,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 4,
      'lat': 22.38928065082619,
      'lng': 114.20966792251976,
      'originalIndex': 3,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 5,
      'lat': 22.389280700179384,
      'lng': 114.20966786080777,
      'originalIndex': 5,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 6,
      'lat': 22.38928446303945,
      'lng': 114.20966315566993,
      'originalIndex': 6,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 7,
      'lat': 22.38931914337168,
      'lng': 114.20961979083138,
      'originalIndex': 7,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 8,
      'lat': 22.3893672,
      'lng': 114.2095597,
      'originalIndex': null,
      'placeId': 'ChIJO-Uk1kAGBDQR71wdLVYS3jg',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 9,
      'lat': 22.3893672,
      'lng': 114.2095597,
      'originalIndex': null,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 10,
      'lat': 22.389475361800816,
      'lng': 114.20943472631346,
      'originalIndex': 8,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 11,
      'lat': 22.389504615050434,
      'lng': 114.20940092609845,
      'originalIndex': 9,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 12,
      'lat': 22.389518245216177,
      'lng': 114.20938517732657,
      'originalIndex': 10,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 13,
      'lat': 22.389577777684586,
      'lng': 114.20931639136622,
      'originalIndex': 11,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 14,
      'lat': 22.389639616603894,
      'lng': 114.20924494035141,
      'originalIndex': 12,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 15,
      'lat': 22.389702167524963,
      'lng': 114.20917266656143,
      'originalIndex': 13,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 16,
      'lat': 22.389758999999998,
      'lng': 114.20910699999999,
      'originalIndex': null,
      'placeId': 'ChIJu75U00AGBDQRxb8lEdOfy_E',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 17,
      'lat': 22.389758999999998,
      'lng': 114.20910699999999,
      'originalIndex': null,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 18,
      'lat': 22.389764228385552,
      'lng': 114.20910064654197,
      'originalIndex': 14,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 19,
      'lat': 22.38983145331111,
      'lng': 114.20901895572153,
      'originalIndex': 15,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 20,
      'lat': 22.389991248704955,
      'lng': 114.20882477400285,
      'originalIndex': 16,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 21,
      'lat': 22.390015876985004,
      'lng': 114.20879484590557,
      'originalIndex': 17,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 22,
      'lat': 22.390075,
      'lng': 114.20872299999999,
      'originalIndex': null,
      'placeId': 'ChIJqVgFLkcGBDQRISdYCJbZcok',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 23,
      'lat': 22.390075,
      'lng': 114.20872299999999,
      'originalIndex': null,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 24,
      'lat': 22.390094830966678,
      'lng': 114.20869892593092,
      'originalIndex': 18,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 25,
      'lat': 22.390161668277585,
      'lng': 114.20861778779475,
      'originalIndex': 19,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 26,
      'lat': 22.3902136437783,
      'lng': 114.20855469128371,
      'originalIndex': 20,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 27,
      'lat': 22.3902136437783,
      'lng': 114.20855469128371,
      'originalIndex': 21,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 28,
      'lat': 22.390231099999998,
      'lng': 114.2085335,
      'originalIndex': null,
      'placeId': 'ChIJnTh7MEcGBDQRk42rr3YNPKw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 29,
      'lat': 22.390231099999998,
      'lng': 114.2085335,
      'originalIndex': null,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 30,
      'lat': 22.39030477188108,
      'lng': 114.20846175736723,
      'originalIndex': 22,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 31,
      'lat': 22.39030477188108,
      'lng': 114.20846175736723,
      'originalIndex': 23,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 32,
      'lat': 22.390338805852924,
      'lng': 114.20842861460821,
      'originalIndex': 24,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 33,
      'lat': 22.390390931285957,
      'lng': 114.20837785408641,
      'originalIndex': 25,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 34,
      'lat': 22.390414228365533,
      'lng': 114.20835516702661,
      'originalIndex': 26,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 35,
      'lat': 22.390414228365533,
      'lng': 114.20835516702661,
      'originalIndex': 27,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 36,
      'lat': 22.3904335,
      'lng': 114.2083364,
      'originalIndex': null,
      'placeId': 'ChIJx0hHOkcGBDQRrZ_tcG8RaEw',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 37,
      'lat': 22.3904335,
      'lng': 114.2083364,
      'originalIndex': null,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 38,
      'lat': 22.390480406603842,
      'lng': 114.20827109741826,
      'originalIndex': 28,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 39,
      'lat': 22.390506867723335,
      'lng': 114.20823425865905,
      'originalIndex': 29,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 40,
      'lat': 22.39053434537202,
      'lng': 114.20819600467657,
      'originalIndex': 30,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 41,
      'lat': 22.390559702282967,
      'lng': 114.20816070312976,
      'originalIndex': 31,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 42,
      'lat': 22.390559702282967,
      'lng': 114.20816070312976,
      'originalIndex': 32,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 43,
      'lat': 22.390591181620135,
      'lng': 114.20811687799164,
      'originalIndex': 33,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 44,
      'lat': 22.390591181620135,
      'lng': 114.20811687799164,
      'originalIndex': 34,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 45,
      'lat': 22.390633533160077,
      'lng': 114.20805791665202,
      'originalIndex': 35,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 46,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': null,
      'placeId': 'ChIJ_yLgO0cGBDQRvf3hqOTz1Es',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 47,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 36,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 48,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 37,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 49,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 38,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 50,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 39,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 51,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 40,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 52,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 41,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    },
    {
      'google_snap_gsp_id': 53,
      'lat': 22.3906357,
      'lng': 114.2080549,
      'originalIndex': 42,
      'placeId': 'ChIJO5HWPkcGBDQR4wtl99DGy98',
      'veh_trip_id': 23307
    }]
  }
}
</script>

<style>
.trips{
  display: flex;
  flex-direction: column;
  height: 480px;
}
.trips-list{
  flex:1;
  width: 200px;
  overflow: auto;
}
</style>
