<template>
  <div>
    <div class="flex-1 m-a">
      <md-card class="map-card">
        <md-card-content class="flex relative">
          <div class="flex flex-1 flex-col">
            <h4 class="md-subheading p-b-sm">Google Map</h4>
            <div class="center-wrapper relative w-100 flex-1">
              <Google-Map-Track-Render ref="gmtr" :ak="$store.state.googleMapAK" :points="points" class="w-100 h-100"></Google-Map-Track-Render>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.pointsLoading || $refs.gmtr.googleApiLoading">
                <md-spinner md-indeterminate></md-spinner>
              </div>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.pointsFailed">
                <md-button class="md-icon-button md-raised md-primary" @click.native="getData()">
                  <md-icon>refresh</md-icon>
                  <md-tooltip md-direction="bottom">Reload</md-tooltip>
                </md-button>
              </div>
            </div>
          </div>

          <div class="trips m-l">
            <h4 class="md-subheading p-b-sm">Trips</h4>
            <div class="center-wrapper flex-1" v-if="$store.state.tripsLoading">
              <md-spinner md-indeterminate></md-spinner>
            </div>
            <div class="center-wrapper flex-1" v-if="$store.state.tripsFailed">
              <md-button class="md-icon-button md-raised md-primary" @click.native="$store.dispatch('getTrips')">
                <md-icon>refresh</md-icon>
                <md-tooltip md-direction="bottom">Reload</md-tooltip>
              </md-button>
            </div>
            <div v-if="noTripsFoundVisible" class="m-t">
              <span class="md-subheading">No Trips Found</span>
            </div>
            <!-- don't use md-list component here, use native html. Or the page will stop responding for a while -->
            <ul class="md-list trips-list md-theme-default" v-show="tripsListVisible">
              <li class="md-list-item" v-for="trip in $store.state.trips">
                <div class="md-list-item-container">
                  <button type="button" :class="['md-button md-theme-default', {'md-raised md-primary': trip.veh_trip_id === $store.state.tripId}]"
                    @click="$store.commit('tripId', trip.veh_trip_id)">
                    {{tripDate(trip)}}
                    <br />
                    {{tripDistance(trip)}} KM
                </button>
                </div>
              </li>
            </ul>

            <!-- issue code -->
            <!-- <md-list class="trips-list" v-show="tripsListVisible">
              <md-list-item v-for="trip in $store.state.trips" :key="trip.veh_trip_id">
                <md-button :class="{'md-raised md-primary': trip.veh_trip_id === $store.state.tripId}"
                  @click.native="$store.commit('tripId', trip.veh_trip_id)">
                  {{tripDate(trip)}}
                  <br />
                  {{tripDistance(trip)}} KM
                </md-button>
              </md-list-item>
            </md-list> -->

          </div>

          <fullscreen-button @click.native="$refs.gmtr.checkSize()"></fullscreen-button>
        </md-card-content>
      </md-card>
    </div>

    <md-layout>
      <md-card  class="flex-1 m-a">

          <md-card-header>
            <div class="md-title fullscreen-button-wrapper">Alert Information<fullscreen-button></fullscreen-button></div>
          </md-card-header>
          <md-card-content>
            <Alert-Infomation></Alert-Infomation>
          </md-card-content>

      </md-card>
    </md-layout>

    <!-- <md-card class="m-a">
      <md-card-header>
        <div class="md-title">Baidu Map<fullscreen-button></fullscreen-button></div>
      </md-card-header>
      <md-card-content>
        <!-- <BaiduMapTrackRender
        :ak="$store.state.baiduMapAK"
        :service-id="$store.state.baiduMapServiceId"
        :points="points"></BaiduMapTrackRender> -->
      </md-card-content>
    </md-card> -->
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
  computed: {
    noTripsFoundVisible() {
      const state = this.$store.state
      return !state.tripsLoading && state.trips.length === 0 && state.vehicle
    },
    tripsListVisible() {
      const state = this.$store.state
      return !state.tripsLoading && !state.tripsFailed
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
        this.$store.commit('pointsFailed', false)
        // http
        this.$http.get('google/' + tripId, {
          cancelToken: new CancelToken((c) => { this._cancelPrevGetDataRequest = c })
        }).then(({data}) => {
          // convert result point format and store
          this.points = data.JSON.map(v => {
            return { lat: v.location.latitude, lng: v.location.longitude }
          })
          this.$store.commit('pointsLoading', false)
        }).catch((e) => {
          this.$store.commit('pointsLoading', false)
          this.$store.commit('pointsFailed', true)
          if (e.toString() !== 'Cancel') {
            window.alert('get points failed')
            throw e
          }
        })
      } else {
        this.points = []
      }
    },
    tripDate(trip) { return format(new Date(trip.start_time), 'MM-dd HH:mm') },
    tripDistance(trip) { return Math.round(trip.drv_distance / 1000) }
  }
}
</script>

<style lang="scss">
.map-card{
  .fullscreen-button{
    position: absolute;
    right: 0;
    top: 6px;
    color: rgba(0, 0, 0, .54);
  }
  .trips{
    display: flex;
    flex-direction: column;
    height: 500px;
    width: 120px;
  }
  .fullscreen .trips{
    height: 100%;
  }
  .trips-list{
    flex:1;
    overflow: auto;
    .md-list{
      padding: 0;
    }
    .md-list-item{
      margin: 3px 0;
    }
    .md-list-item-container{
      padding: 0;
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
      line-height: 24px;
    }
  }
}
</style>
