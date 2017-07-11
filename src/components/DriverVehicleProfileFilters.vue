<template>
  <div class="driver-vehivle-profile-filters">
    <Select2 :options="types" value-key="value" text-key="text" v-model="type" :search-visible="false"></Select2>
    &nbsp;
    <Select2 v-if="state.type=='driver'" :options="state.drivers" value-key="driver_id" text-key="name" v-model="driver" :search-visible="true"></Select2>
    <Select2 v-else-if="state.type=='vehicle'" :options="state.vehicles" value-key="vrm_id" text-key="vrm_mark_code" v-model="vehicle" :search-visible="true"></Select2>
    &nbsp;
    <Select2 :options="dateTypes" value-key="value" text-key="text" v-model="dateType" :search-visible="false"></Select2>
  </div>
</template>

<script>
import { numPad } from 'helper-js'
import { format, subDays } from 'date-functions'
import Select2 from '../components/Select2.vue'
import DatePicker from '../components/DatePicker.vue'

const md = 'driverVehicleProfile' // vuex module name

export default {
  components: { Select2, DatePicker },
  data() {
    return {
      types: [
        {value: 'driver', text: this.$t('driver')},
        {value: 'vehicle', text: this.$t('vehicle')},
      ],
      dateTypes: [
        {value: 'daily', text: this.$t('daily')},
        {value: 'weekly', text: this.$t('weekly')},
        {value: 'monthly', text: this.$t('monthly')},
        {value: 'yearly', text: this.$t('yearly')},
      ],
    }
  },
  computed: {
    state() { return this.$store.state.driverVehicleProfile },
    type: {
      get() { return this.state.type },
      set(value) { this.$store.commit(`${md}/type`, value) },
    },
    driver: {
      get() { return this.state.driver },
      set(value) { this.$store.commit(`${md}/driver`, value) },
    },
    vehicle: {
      get() { return this.state.vehicle },
      set(value) { this.$store.commit(`${md}/vehicle`, value) },
    },
    dateType: {
      get() { return this.state.dateType },
      set(value) { this.$store.commit(`${md}/dateType`, value) },
    },
    minDateDaily() {
      if (this.dateType === 'daily') {
        return format(subDays(new Date(), 13), 'yyyy-MM-dd')
      }
    },
    maxDateDaily() {
      if (this.dateType === 'daily') {
        return format(new Date(), 'yyyy-MM-dd')
      }
    },
    optionsMonthly() {
      const now = new Date()
      const nowYear = now.getFullYear()
      const nowMonth = now.getMonth() + 1
      const result = []
      let year = nowYear
      let month = nowMonth
      for (let i = 12; i > 0; i--) {
        const str = `${year}-${numPad(month, 2)}`
        result.push({value: str, text: str})
        month--
        if (month === 0) {
          month = 12
          year--
        }
      }
      return result
    },
    optionsWeekly() {
      const date = new Date()
      subDays(date, date.getDay()) // this week start
      const result = []
      for (let i = 14; i > 0; i--) {
        const str = format(date, 'yyyy-MM-dd')
        result.push({value: str, text: str})
        subDays(date, 7)
      }
      return result
    },
    optionsYearly() {
      const now = new Date()
      const nowYear = now.getFullYear()
      const result = []
      let year = nowYear
      for (let i = 7; i > 0; i--) {
        const str = year.toString()
        result.push({value: str, text: str})
        year--
      }
      return result
    },
  },
  created() {
    this.$store.dispatch(`driverVehicleProfile/getDrivers`)
    this.$store.dispatch(`driverVehicleProfile/getDriverInfos`)
    this.$store.dispatch(`driverVehicleProfile/getAllDriverRanks`)
    this.$store.dispatch(`driverVehicleProfile/getVehicles`)
    this.$store.dispatch(`driverVehicleProfile/getVehicleInfos`)
    this.$store.dispatch(`driverVehicleProfile/getAllVehicleRanks`)
  },
  // methods:
}
</script>
<style lang="scss">
.driver-vehivle-profile-filters{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex: 1;
    padding-right: 150px;
    .date-picker{
      align-self: flex-end;
      width: 80px;
      height: auto!important;
      border-bottom: 1px solid #fff;
      .input-wrapper{
        height: auto;
        padding: 0;
        input{
          padding: 0;
          border: none;
        }
      }
    }
}
</style>
