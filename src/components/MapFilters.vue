<template>
  <div class="map-filters">
   <label for="vehicle_select" class="m-r-sm">{{$t('vehicle')}}</label>
   <Vehicle-Select :options="$store.state.vehicles" value-key="vrm_id" text-key="vrm_mark_code" v-model="vehicle"></Vehicle-Select>

   <Date-Range-Picker-In-Top class="m-l" v-model="dateRange"></Date-Range-Picker-In-Top>
  </div>
</template>
<script>
import VehicleSelect from '@/components/VehicleSelect.vue'
import DateRangePickerInTop from './DateRangePickerInTop.vue'
import { mapActions } from 'vuex'
import { retry } from 'helper-js'

export default {
  components: { VehicleSelect, DateRangePickerInTop },
  data() {
    return {
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
        if (this.$store.state.allTrips) {
          this.getTripsInDateRange().then((trips) => {
            this.updateTrips(trips)
          })
        }
      }
    },
    vehicle: {
      immediate: true,
      handler() { this.getTrips() }
    },
  },
  methods: {
    ...mapActions(['getTrips', 'getTripsInDateRange', 'updateTrips']),
    getVehicles() {
      retry(() => this.$http.get('dao/veh_reg_mark'))()
      .then(({data}) => {
        // sort by vrm_mark_code asc
        const vehicles = data.JSON.sort((a, b) => {
          const aCode = a.vrm_mark_code
          const bCode = b.vrm_mark_code
          if (aCode < bCode) {
            return -1
          }
          if (aCode > bCode) {
            return 1
          }
          // names must be equal
          return 0
        })
        this.$store.commit('vehicles', vehicles)
        this.getTrips()
      }).catch((e) => {
        this.$alert(this.$t('getVehiclesFailed'))
        throw e
      })
    }
  },
  created() {
    this.getVehicles()
  }
}
</script>
<style lang="scss">
.map-filters{
  display: flex;
  align-items: center;
  justify-content: center;
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
