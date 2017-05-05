<template>
  <div id="app" class="container">
    <Login v-if="!$store.state.authenticated"></Login>
    <template v-else>
      <md-whiteframe class="menu-layer">
        <md-toolbar md-theme="blue">
          <md-button class="md-icon-button" @click.native="toggleLeftSidenav">
            <md-icon>menu</md-icon>
          </md-button>


          <h2 class="md-title" style="flex: 1">{{$t('brand')}}</h2>

          <md-button class="md-fab md-clean md-mini settings-bar-switch" @click.native="toggleRightSidenav">
           <md-icon>more_horiz</md-icon>
           <md-tooltip md-direction="left">{{$t('settings')}}</md-tooltip>
         </md-button>

         <div class="map-filters">
           <label for="vehicle_select" class="m-r-sm">Vehicle</label>
           <md-input-container md-inline class="vehicle-select-container m-r">
             <md-select name="vehicle_select" id="vehicle_select" v-model="vehicle">
               <md-option v-for="item in vehicles" :key="item.vrm_id" :value="item.vrm_id">{{item.vrm_mark_code}}</md-option>
             </md-select>
           </md-input-container>

           <div class="date-range">
             <label class="m-r-sm">Date Range</label>
             <date-picker class="date-picker" v-model="dateRange" :language="$store.state.lang == 'en' ? 'en' : 'ch'" :range="true"></date-picker>
           </div>
         </div>


        </md-toolbar>
      </md-whiteframe>

      <md-sidenav md-theme="blue" class="md-left sidebar-layer" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
          <md-toolbar class="md-large">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('brand')}}</h3>
            </div>
          </md-toolbar>

          <md-list>
            <md-list-item v-for="(item, index) in $store.state.menu"
            :key="index"
            :href="$router.resolve({name:item.routeName}).href"
            @click.native.prevent="$router.push({name:item.routeName})"
            >
              <md-icon>{{item.icon}}</md-icon> <span>{{$t(item.text)}}</span>
            </md-list-item>
          </md-list>

      </md-sidenav>

      <md-sidenav md-theme="blue" class="md-right sidebar-layer" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
          <md-toolbar class="">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('settings')}}</h3>
            </div>
          </md-toolbar>

          <form novalidate @submit.stop.prevent="updateSettings">
            <div style="padding:0 1em;">
              <md-input-container>
                <label for="mapSelect">{{$t('map')}}</label>
                <md-select name="map" id="mapSelect" v-model="settings.map">
                  <md-option value="googleMap">{{$t('googleMap')}}</md-option>
                  <md-option value="baiduMap">{{$t('baiduMap')}}</md-option>
                </md-select>
              </md-input-container>
              <md-input-container>
                <label for="langSelect">{{$t('language')}}</label>
                <md-select name="lang" id="langSelect" v-model="settings.lang">
                  <md-option value="en">{{$t('Englsih')}}</md-option>
                  <md-option value="zh-cn">{{$t('simplifiedChinese')}}</md-option>
                  <md-option value="zh-tw">{{$t('traditionalChinese')}}</md-option>
                </md-select>
              </md-input-container>
            </div>
            <md-button class="md-raised md-primary" type="submit">{{$t('update')}}</md-button>
          </form>

      </md-sidenav>

      <div class="page-content main-layer">
        <keep-alive>
           <router-view></router-view>
        </keep-alive>
      </div>
    </template>
  </div>
</template>

<script>
import Login from '@/components/Login.vue'
import DatePicker from '@/components/DatePicker.vue'
export default {
  components: { Login, DatePicker },
  data () {
    const state = this.$store.state
    return {
      settings: {
        map: state.map,
        lang: state.lang,
      },
      vehicles: []
    }
  },
  computed: {
    dateRange: {
      get() { return this.$store.state.dateRange },
      set(value) { this.$store.commit('dateRange', value) }
    },
    vehicle: {
      get() { return this.$store.state.vehicle },
      set(value) { this.$store.commit('vehicle', value) }
    }
  },
  watch: {
    dateRange: {
      deep: true,
      immediate: true,
      handler() {
        if (this._allTrips) {
          this.updateTrips(this.getTripsInDateRange())
        }
      }
    },
    vehicle: {
      immediate: true,
      handler() { this.getTrips() }
    }
  },
  methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle()
    },
    toggleRightSidenav() {
      this.$refs.rightSidenav.toggle()
    },
    closeRightSidenav() {
      this.$refs.rightSidenav.close()
    },
    open(ref) {
      console.log('Opened: ' + ref)
    },
    close(ref) {
      console.log('Closed: ' + ref)
    },
    updateSettings() {
      this.$store.commit('map', this.settings.map)
      this.$store.commit('lang', this.settings.lang)
    },
    getTrips() {
      const vehicle = this.vehicle
      if (vehicle != null) {
        // cancel prev request
        this._cancelPrevgetTripsRequest && this._cancelPrevgetTripsRequest()
        const Axios = this.$root.constructor.Axios
        const CancelToken = Axios.CancelToken
        this.$store.commit('tripsLoading', true)
        // http
        this.$http.get('dao/veh_trip/' + vehicle, {
          cancelToken: new CancelToken((c) => { this._cancelPrevgetTripsRequest = c })
        }).then(({data}) => {
          this._allTrips = data.JSON
          this.updateTrips(this.getTripsInDateRange())
          this.$store.commit('tripsLoading', false)
        })
      }
    },
    getTripsInDateRange() {
      const start = new Date(`${this.dateRange[0]} 00:00:00`).getTime()
      const end = new Date(`${this.dateRange[1]} 23:59:59`).getTime()
      const trips = this._allTrips
      // filter by date range
      .filter(v => start <= v.start_time && v.start_time <= end)
      // sort by start_time desc
      .sort((a, b) => b.start_time - a.start_time)
      return trips
    },
    // update trips and auto set value of trip id
    updateTrips(trips) {
      this.$store.commit('trips', trips)
      const state = this.$store.state
      if (state.trips.length === 0) {
        this.$store.commit('tripId', null)
      }
      // trip dont exists in trips list
      else if (state.tripId == null || !state.trips.find(v => v.veh_trip_id === state.tripId)) {
        this.$store.commit('tripId', state.trips[0].veh_trip_id)
      }
    }
  },
  created() {
    // get vehicles
    this.$http.get('dao/veh_reg_mark').then(({data}) => {
      this.vehicles = data.JSON
      this.vehicle = this.vehicles[0].vrm_id
      this.getTrips()
    })
  }
}

</script>

<!-- base -->
<style lang="scss">
// the css about svg in vue-material.css will effect baidu map overlays, add svg{max-width: inherit;} to prevent that (already added in baidu-map-track-render-vue )
@import "../node_modules/vue-material/dist/vue-material.css";
// layer.css should after vue-material.css
@import "./assets/css/layer.css";
@import "../node_modules/css-spacing-helper/css-spacing-helper.css";
@import "./assets/css/helper.css";

body, html{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<!-- layout -->
<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction:column;
}
.page-content {
  flex: 1;
  overflow: auto;
}
</style>

<!-- other -->
<style lang="scss">
.settings-bar-switch{
  position: absolute;
  right: 10px;
  bottom: -20px;
  margin: 0;
}
.map-filters{
  display: flex;
  align-items: center;
}
.vehicle-select-container{
  width: auto;
  min-height: initial;
  height: 31px;
  padding: 0px;
  margin-bottom: 15px;
}
.date-range{
  display: flex;
  align-items: center;
  label{
    white-space: nowrap;
  }
}
.date-picker{
  color: #000;
  input{
    width: auto;
    border: none;
    background: none;
    color: #fff;
    border-bottom: 1px solid #fff;
  }
  ul.weeks li{
    margin-top: 0;
  }
}
</style>
