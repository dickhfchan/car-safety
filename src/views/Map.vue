<template>
  <div>
    <div class="flex-1 m-a m-b-0">
      <md-card class="map-card card-1">
        <md-card-content class="flex relative">
          <div class="flex flex-1 flex-col">
            <h2 class="md-title">{{mapCardTitle}} <small style="color:grey;">{{$store.state.tripId}}</small></h2>
            <div class="center-wrapper relative w-100 flex-1">
              <Google-Map-Track-Render v-if="mapType === 'googleMap'"
              ref="gmtr" :ak="$store.state.googleMapAK" :points="$store.state.points" class="w-100 h-100"></Google-Map-Track-Render>
              <Baidu-Map-Track-Render v-if="mapType === 'baiduMap'"
              ref="bmtr" :ak="$store.state.baiduMapAK" :points="$store.state.points" class="w-100 h-100"></Baidu-Map-Track-Render>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.pointsLoading">
                <md-spinner md-indeterminate></md-spinner>
              </div>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.pointsFailed">
                <md-button class="md-icon-button md-raised md-primary" @click.native="getPoints()">
                  <md-icon>refresh</md-icon>
                  <md-tooltip md-direction="bottom">{{$t('reload')}}</md-tooltip>
                </md-button>
              </div>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.tripId == null && !$store.state.tripsLoading">
                <span class="md-title">No Trip Selected</span>
              </div>
              <div class="absolute-backdrop center-wrapper" v-show="$store.state.tripId != null && $store.state.points.length === 0 && !$store.state.pointsLoading && !$store.state.pointsFailed">
                <span class="md-title">No Data</span>
              </div>
            </div>
          </div>

          <div class="trips">
            <h2 class="md-title">{{$t('trips')}}</h2>
            <div class="center-wrapper flex-1" v-if="$store.state.tripsLoading">
              <md-spinner md-indeterminate></md-spinner>
            </div>
            <div class="center-wrapper flex-1" v-if="$store.state.tripsFailed">
              <md-button class="md-icon-button md-raised md-primary" @click.native="$store.dispatch('getTrips')">
                <md-icon>refresh</md-icon>
                <md-tooltip md-direction="bottom">{{$t('reload')}}</md-tooltip>
              </md-button>
            </div>
            <div v-if="noTripsFoundVisible" class="md-subheading no-trips-found">No Trips Found</div>
            <!-- don't use md-list component here, use native html. Or the page will stop responding for a while -->
            <!-- don't add <md-ink-ripple /> to button, it will effect performance -->
            <div class="trips-list" v-show="tripsListVisible">
              <button type="button"
                v-for="trip in $store.state.trips"
                :class="['md-button md-theme-default', {'md-raised md-primary': trip.veh_trip_id === $store.state.tripId}]"
                @click="$store.commit('tripId', trip.veh_trip_id)"
              >
                <span class="time">{{tripDate(trip)}}</span>
                <br />
                <span class="distance">{{tripDistance(trip)}} KM</span>
              </button>
            </div>

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
          <div class="card-buttons">
            <fullscreen-button @click.native="onMapCardFullscreen"></fullscreen-button>
          </div>
        </md-card-content>
      </md-card>
    </div>

    <md-layout>
      <md-card  class="flex-1 m-x m-b card-1 alert-information-card">
        <md-card-content>
          <div class="flex title-left">
            <h2 class="md-title">{{$t('alertInformation')}}</h2>
            <div class="filters">
              <div class="type-filter" v-if="$refs && $refs.alertInformation">
                <label class="m-l grey">{{$t('type')}}:</label>
                <md-select class="m-l-sm inline-md warning-type-select" v-model="alertInformationWarningType">
                  <md-option value="all">{{$t('all')}}</md-option>
                  <md-option v-for="(val, key) in $refs.alertInformation.warningTypesI18n" :key="key" :value="key">{{val}}</md-option>
                </md-select>
              </div>
            </div>
          </div>
          <Alert-Information ref="alertInformation"></Alert-Information>
          <div class="card-buttons">
            <md-switch class="md-primary" v-model="isAlertInfoShowInMap" @click.native="toggleShowInMap" v-show="showInMapToggleVisible">{{$t('showInMap')}}</md-switch>
            <md-button class="md-icon-button" @click.native="$refs.alertInformation.exportExcel()">
              <md-icon>get_app</md-icon>
              <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
            </md-button>
            <md-button class="md-icon-button" @click.native="$refs.alertInformation.getData()">
              <md-icon>refresh</md-icon>
              <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
            </md-button>
            <fullscreen-button></fullscreen-button>
          </div>
        </md-card-content>
      </md-card>
    </md-layout>

    <!-- <md-card class="m-a">
      <md-card-header>
        <div class="md-title">Baidu Map<fullscreen-button></fullscreen-button></div>
      </md-card-header>
      <md-card-content>
        <BaiduMapTrackRender
        :ak="$store.state.baiduMapAK"
        :service-id="$store.state.baiduMapServiceId"
        :points="points"></BaiduMapTrackRender>
      </md-card-content>
    </md-card> -->
  </div>
</template>

<script>
import BaiduMapTrackRender from '../components/BaiduMapTrackRender.vue'
import GoogleMapTrackRender from '../components/GoogleMapTrackRender.vue'
import AlertInformation from './AlertInformation.vue'
import { format } from 'date-functions'
import { mapActions } from 'vuex'
export default {
  components: {
    BaiduMapTrackRender,
    GoogleMapTrackRender,
    AlertInformation
  },
  data() {
    return {
      title: this.$t('map'),
      isAlertInfoShowInMap: false,
    }
  },
  computed: {
    mapType() { return this.$store.state.map },
    mapCardTitle() {
      switch (this.mapType) {
        case 'googleMap':
          return this.$t('googleMap')
        case 'baiduMap':
          return this.$t('baiduMap')
        default:
          return ''
      }
    },
    noTripsFoundVisible() {
      const state = this.$store.state
      return !state.tripsLoading && !state.tripsFailed && state.trips.length === 0 && state.vehicle
    },
    tripsListVisible() {
      const state = this.$store.state
      return !state.tripsLoading && !state.tripsFailed && !this.noTripsFoundVisible
    },
    alertInformationWarningType: {
      get() { return this.$store.state.alertInformationWarningType },
      set(value) { this.$store.commit('alertInformationWarningType', value) }
    },
    showInMapToggleVisible() {
      const state = this.$store.state
      const ai = this.$refs && this.$refs.alertInformation
      return !state.alertInformationRowsExpired && !state.pointsExpired && !state.pointsFailed && !state.pointsLoading && state.points.length && ai && ai.rows.length
    }
  },
  watch: {
    '$store.state.tripId'() { this.getPoints() },
    'mapType'() { this.getPoints() },
    showInMapToggleVisible(v) { if (!v) this.isAlertInfoShowInMap = false },
    '$store.state.points'() {
      try {
        this.$refs.alertInformation.clearMarkers()
      } catch (e) {}
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    ...mapActions(['getPoints']),
    tripDate(trip) { return `${format(new Date(trip.start_time), 'MM-dd HH:mm')}-${format(new Date(trip.end_time), 'HH:mm')}` },
    tripDistance(trip) { return (trip.drv_distance / 100000).toFixed(1) },
    onMapCardFullscreen() {
      if (this.mapType === 'googleMap') {
        this.$refs.gmtr.checkSize()
      } else if (this.mapType === 'baiduMap') {
        this.$refs.bmtr.checkSize()
      }
    },
    toggleShowInMap() {
      if (this.isAlertInfoShowInMap) {
        this.$refs.alertInformation.renderAlertPoint()
      } else {
        this.$refs.alertInformation.clearMarkers()
      }
    }
  }
}
</script>

<style lang="scss">
.map-card{
  .trips{
    display: flex;
    flex-direction: column;
    height: 500px;
    width: 160px;
  }
  &.fullscreen .trips{
    height: 100%;
  }
  .no-trips-found{
    font-size: 15px;
    color: #5c5c5c;
    text-align: center;
  }
  .trips-list{
    flex:1;
    overflow: auto;
    border-top: 1px solid #e9e9e9;
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
      padding: 0 3px;
      .distance{
        font-size: 12px;
      }
    }
    .md-button:not(.md-primary){
      .time{

      }
      .distance{
        color: rgba(0,0,0,.54);
      }
    }
  }
}
.alert-information-card.md-card{
  .title-left{
    align-items: center;
  }
  .type-filter{
    display: flex;
    align-items: center;
  }
  .warning-type-select{
    .md-select-value{
      font-size: 14px;
      color: grey;
    }
  }
  .card-buttons{
    @media(max-width: 500px){
      top:20px;
    }
  }
}
</style>
