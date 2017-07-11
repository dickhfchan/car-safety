<template>
  <div class="map-filters">
    <label>{{$t('group')}}</label>&nbsp;
    <Select2 v-if="vehicleOrDriver=='vehicle'" :options="vehicleGroups" value-key="vrm_grp_id" text-key="grp_alias" v-model="vehicleGroup" :search-visible="false"></Select2>
    <Select2 v-else-if="vehicleOrDriver=='driver'" :options="driverGroups" value-key="drv_grp_id" text-key="grp_alias" v-model="driverGroup" :search-visible="false"></Select2>
    &nbsp;
    <Select2 :options="vehicleOrDriverOptions" value-key="value" text-key="text" v-model="vehicleOrDriver" :search-visible="false"></Select2>
    &nbsp;
    <Select2 v-if="vehicleOrDriver=='vehicle'" :options="$store.state.vehicles" value-key="vrm_id" text-key="vrm_mark_code" v-model="vehicle"></Select2>
    <Select2 v-else-if="vehicleOrDriver=='driver'" :options="$store.state.drivers" value-key="driver_id" text-key="name" v-model="driver"></Select2>
    &nbsp;
   <Date-Range-Picker-In-Top v-model="dateRange"></Date-Range-Picker-In-Top>
  </div>
</template>
<script>
import Select2 from '@/components/Select2.vue'
import DateRangePickerInTop from './DateRangePickerInTop.vue'
import { mapActions } from 'vuex'
import { sortRowsByProp } from '@/utils.js'

export default {
  components: { Select2, DateRangePickerInTop },
  data() {
    return {
      vehicleOrDriverOptions: [
        { value: 'vehicle', text: this.$t('vehicle') },
        { value: 'driver', text: this.$t('driver') },
      ],
      vehicleGroups: [],
      driverGroups: [],
      vehicleGroup: null,
      driverGroup: null,
    }
  },
  computed: {
    dateRange: {
      get() { return this.$store.state.dateRange },
      set(value) { this.$store.commit('dateRange', value) }
    },
    vehicleOrDriver: {
      get() { return this.$store.state.vehicleOrDriver },
      set(value) { this.$store.commit('vehicleOrDriver', value) }
    },
    vehicle: {
      get() { return this.$store.state.vehicle },
      set(value) { this.$store.commit('vehicle', value) }
    },
    driver: {
      get() { return this.$store.state.driver },
      set(value) { this.$store.commit('driver', value) }
    }
  },
  watch: {
    dateRange: {
      deep: true,
      immediate: true,
      handler() {
        if (this.$store.state.allTrips) {
          this.getTripsInDateRange().then((trips) => {
            this.updateTrips(trips)
          })
        }
      }
    },
    vehicle: {
      immediate: true,
      handler(val, oldVal) { val !== oldVal && this.getTrips() }
    },
    driver: {
      immediate: true,
      handler(val, oldVal) { val !== oldVal && this.getTrips() }
    },
    vehicleOrDriver: {
      immediate: true,
      handler(val, oldVal) {
        const store = this.$store
        store.commit('trips', [])
        if (val !== oldVal) {
          if (val === 'vehicle') {
            store.commit('vehicle', null)
            this.getVehicles()
            this.getVehicleGroups()
          } else if (val === 'driver') {
            store.commit('driver', null)
            this.getDrivers()
            this.getDriverGroups()
          }
          this.getTrips()
        }
      }
    },
    vehicleGroup() { this.filterVehicles() },
    driverGroup() { this.filterDrivers() },
  },
  methods: {
    ...mapActions(['getTrips', 'getTripsInDateRange', 'updateTrips']),
    getVehicles() {
      if (!this.veh_reg_mark_group_dtl) {
        this.veh_reg_mark_group_dtl = this.$http.get('dao/veh_reg_mark_group_dtl')
      }
      Promise.all([this.veh_reg_mark_group_dtl, this.$http.get('dao/veh_reg_mark')])
      .then((responses) => {
        const groupMapRows = responses[0].data.JSON
        const groupMap = {}
        groupMapRows.forEach(row => { groupMap[row.vrm_id] = row.vrm_grp_id })
        const data = responses[1].data
        // sort by vrm_mark_code asc
        const vehicles = data.JSON
        .filter(row => row.company_id === this.$store.state.user.company_id)
        sortRowsByProp(vehicles, 'vrm_mark_code')
        vehicles.forEach(row => { row.group_id = groupMap[row.vrm_id] })
        this._vehicles = vehicles
        this.filterVehicles()
        // auto select first vehicle
        // if (state.vehicles[0] && !state.vehicles.find(v => v.vrm_id === state.vehicle)) {
        //   commit('vehicle', state.vehicles[0].vrm_id)
        // }
      }).catch((e) => {
        this.$alert(this.$t('errorRefreshOrFeedback'))
        throw e
      })
    },
    getDrivers() {
      if (!this.driver_group_dtl) {
        this.driver_group_dtl = this.$http.get('dao/driver_group_dtl')
      }
      Promise.all([this.driver_group_dtl, this.$http.get('dao/driver')])
      .then((responses) => {
        const groupMapRows = responses[0].data.JSON
        const groupMap = {}
        groupMapRows.forEach(row => { groupMap[row.driver_id] = row.drv_grp_id })
        const items = responses[1].data.JSON
        .filter(row => row.company_id === this.$store.state.user.company_id)
        sortRowsByProp(items, 'name')
        items.forEach(row => { row.group_id = groupMap[row.driver_id] })
        this._drivers = items
        this.filterDrivers()
      }).catch((e) => {
        this.$alert(this.$t('errorRefreshOrFeedback'))
        throw e
      })
    },
    filterVehicles() {
      this.$store.commit('vehicles', this.vehicleGroup ? this._vehicles.filter(v => v.group_id === this.vehicleGroup) : this._vehicles)
    },
    filterDrivers() {
      this.$store.commit('drivers', this.driverGroup ? this._drivers.filter(v => v.group_id === this.driverGroup) : this._drivers)
    },
    getVehicleGroups() {
      this.$http.get('dao/veh_reg_mark_group').then(({data}) => {
        const items = data.JSON
        .filter(row => row.company_id === this.$store.state.user.company_id)
        sortRowsByProp(items, 'grp_alias')
        items.splice(0, 0, { vrm_grp_id: null, grp_alias: this.$t('all') })
        this.vehicleGroups = items
        this.filterVehicles()
      })
    },
    getDriverGroups() {
      this.$http.get('dao/driver_group').then(({data}) => {
        const items = data.JSON
        .filter(row => row.company_id === this.$store.state.user.company_id)
        sortRowsByProp(items, 'grp_alias')
        items.splice(0, 0, { drv_grp_id: null, grp_alias: this.$t('all') })
        this.driverGroups = items
        this.filterDrivers()
      })
    },
  },
  created() {
    // dont observe
    this._vehicles = []
    this._drivers = []
  }
}
</script>
<style lang="scss">
.map-filters{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex: 1;
  padding-right: 150px;
  .md-select{
    min-width: initial;
  }
  // change caret color
  .md-select:not(.md-disabled):after, .md-input-container.md-has-select:hover .md-select:not(.md-disabled):after{
    color: #fff;
    top: 18px;
  }
  .md-select-value{
    height: auto;
    font-size: 14px;
    line-height: inherit;
    top: 11px;
    color: #fff;
  }
}
@media (max-width:960px) {
  .map-filters{
    justify-content: flex-end;
    padding-right: 0;
  }
}
.vehicle-select-container{
  width: auto;
  min-height: initial;
  height: 31px;
  padding: 0px;
  margin-bottom: 15px;
}
</style>
