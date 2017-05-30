<template>
  <div class="real-time">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('realTime')}}</h2>

        <div class="relative flex-1 overflow-hidden-y map-wrapper">
          <Google-Map-Real-Time v-if="mapType === 'googleMap'"
          ref="gmrt" :points="points" :ak="$store.state.googleMapAK"
          :active-color="activeColor" :expired-color="expiredColor" class="w-100 h-100"></Google-Map-Real-Time>
          <Baidu-Map-Real-Time  v-if="mapType === 'baiduMap'"
          ref="bmrt" :points="points" :ak="$store.state.baiduMapAK"
          :active-color="activeColor" :expired-color="expiredColor" class="w-100 h-100"></Baidu-Map-Real-Time>
          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
        </div>

        <div class="card-buttons">
          <fullscreen-button @click.native="onMapCardFullscreen"></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import GoogleMapRealTime from '../components/GoogleMapRealTime.vue'
import BaiduMapRealTime from '../components/BaiduMapRealTime.vue'
import {retry} from 'helper-js'
import { subMinutes } from 'date-functions'
export default {
  components: {
    GoogleMapRealTime,
    BaiduMapRealTime
  },
  data() {
    return {
      title: this.$t('realTime'),
      points: [],
      activeColor: '#FF0000',
      expiredColor: '#737373'
    }
  },
  computed: {
    mapType() { return this.$store.state.map },
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    getPoints() {
      retry(() => this.$http.get('dao/mob_device'))()
      .then(({data}) => {
        const points = data.JSON
        .filter(
          p => p.lat && p.lng &&
          p.company_id === this.$store.state.user.company_id
        )
        points.sort((a, b) => b.last_loc_update_ts - a.last_loc_update_ts)
        const now = new Date()
        const expiredAt = subMinutes(now, 10).getTime()
        points.forEach(p => {
          if (p.last_loc_update_ts < expiredAt) {
            p.expired = true
          }
        })
        this.points = points
      })
    },
    onMapCardFullscreen() {
      if (this.mapType === 'googleMap') {
        this.$refs.gmrt.checkSize()
      } else if (this.mapType === 'baiduMap') {
        this.$refs.bmrt.checkSize()
      }
    }
  },
  created() {
    this.getPoints()
    this._getPointsInterval = window.setInterval(() => {
      this.getPoints()
    }, 1000 * 60)
  },
  beforeDestroy() {
    window.clearInterval(this._getPointsInterval)
  }
}
</script>

<style lang="scss">
.real-time{
  .map-wrapper{
    height: 600px;
  }
}
</style>
