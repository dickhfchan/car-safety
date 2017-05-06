<template>
  <div>
    <div class="flex-1 m-a">
      <md-card>
        <md-card-header>
          <div class="md-title">Google Map<fullscreen-button @click.native="$refs.gmtr.checkSize()"></fullscreen-button></div>
        </md-card-header>

        <md-card-content class="flex">
          <div class="center-wrapper flex-1 relative">
            <GoogleMapTrackRender ref="gmtr" :ak="$store.state.googleMapAK" :points="points" class="w-100 h-100"></GoogleMapTrackRender>
            <div class="absolute-backdrop center-wrapper" v-show="$store.state.pointsLoading || $refs.gmtr.googleApiLoading">
              <md-spinner md-indeterminate></md-spinner>
            </div>
          </div>

          <div class="trips m-l">
            <h4 class="md-title trips-not-found">Trips</h4>
            <div class="center-wrapper flex-1" v-if="$store.state.tripsLoading">
              <md-spinner md-indeterminate></md-spinner>
            </div>
            <div v-if="!$store.state.tripsLoading && $store.state.trips.length === 0 && $store.state.vehicle" class="m-t">
              <span class="md-subheading">No Trips Found</span>
            </div>
            <md-list class="trips-list" v-show="!$store.state.tripsLoading">
              <md-list-item v-for="trip in $store.state.trips" :key="trip.veh_trip_id">
                <md-button :class="{'md-raised md-primary': trip.veh_trip_id === $store.state.tripId}"
                  @click.native="$store.commit('tripId', trip.veh_trip_id)">{{tripDisplayText(trip)}}</md-button>
              </md-list-item>
            </md-list>
          </div>

        </md-card-content>
      </md-card>
    </div>

    <md-layout>
      <md-card  class="flex-1 m-a">

          <md-card-header>
            <div class="md-title">Alert Information<fullscreen-button></fullscreen-button></div>
          </md-card-header>
          <md-card-content>
            <AlertInfomation></AlertInfomation>
          </md-card-content>

      </md-card>
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
import { format } from 'date-functions'
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
  watch: {
    '$store.state.tripId'() { this.getData() },
    '$store.state.dateRange': {
      deep: true,
      immediate: true,
      handler() { this.getData() }
    },
  },
  methods: {
    // get map points
    getData() {
      const tripId = this.$store.state.tripId
      if (tripId != null) {
        // cancel prev request
        this._cancelPrevGetDataRequest && this._cancelPrevGetDataRequest()
        const Axios = this.$root.constructor.Axios
        const CancelToken = Axios.CancelToken
        this.$store.commit('pointsLoading', true)
        // http
        this.$http.get('google/' + tripId, {
          cancelToken: new CancelToken((c) => { this._cancelPrevGetDataRequest = c })
        }).then(({data}) => {
          // convert result point format and store
          this.points = data.JSON.map(v => {
            return { lat: v.location.latitude, lng: v.location.longitude }
          })
          this.$store.commit('pointsLoading', false)
        })
      } else {
        this.points = []
      }
    },
    tripDisplayText(trip) {
      return `${format(new Date(trip.start_time), 'yy-MM-dd')}  ${Math.round(trip.drv_distance / 1000)} KM`
    }
  }
}
</script>

<style lang="scss" scoped>
.md-card-header{
  padding-top: 0;
  padding-bottom: 0;
  .md-title{
    font-size: 20px;
  }
}
.trips{
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 180px;
}
.fullscreen .trips{
  height: 100%;
}
.trips-list{
  flex:1;
  overflow: auto;
  .md-list-item{
    margin: 3px 0;
  }
  .md-list-item-container{
    padding: 0;
    min-height: inherit;;
  }
  .md-button{
    margin: 0;
    text-align: left;
    text-transform: none;
    white-space: normal;
    font-weight: normal;
    width: 100%;
  }
}
</style>
