<template>
  <div class="driver-vehivle-profile-filters">
    <Select2 :options="types" value-key="value" text-key="text" v-model="type" :search-visible="false"></Select2>
    &nbsp;
    <Select2 v-if="state.type=='driver'" :options="state.drivers" value-key="driver_id" text-key="name" v-model="driver" :search-visible="false"></Select2>
    <Select2 v-else-if="state.type=='vehicle'" :options="state.vehicles" value-key="vehicle_id" text-key="vrm_mark_code" v-model="vehicle" :search-visible="false"></Select2>
    &nbsp;
    <Select2 :options="dateTypes" value-key="value" text-key="text" v-model="dateType" :search-visible="false"></Select2>
  </div>
</template>

<script>
import Select2 from '../components/Select2.vue'

const md = 'driverVehicleProfile' // vuex module name

export default {
  components: { Select2 },
  data() {
    return {
      types: [
        {value: 'driver', text: this.$t('driver')},
        {value: 'vehicle', text: this.$t('vehicle')},
      ],
      dateTypes: [
        {value: 'daily', text: this.$t('daily')},
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
  },
  watch: {
    'state.type': {
      immediate: true,
      handler(v) {
        this.$store.dispatch(`driverVehicleProfile/${v === 'driver' ? 'getDrivers' : 'getVehicles'}`)
      }
    }
  },
  created() {
  }
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
}
</style>
