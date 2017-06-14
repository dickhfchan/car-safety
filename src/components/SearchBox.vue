<template>
  <div class="search-box">
    <Map-Filters v-if="$route.name === 'map'"></Map-Filters>
    <Date-Range-Picker-In-Top v-else-if="$route.name === 'd2'" v-model="dateRangeInD2" class="d2-date-range"></Date-Range-Picker-In-Top>
    <div v-else-if="$route.name === 'report2'"  class="report2-select-wrapper">
      <label for="vehicle_select" class="m-r-sm">{{$t('driver')}}</label>
      <Select2 :options="$store.state.report2Drivers" value-key="driver_id" text-key="name" v-model="report2DriverId"></Select2>
      <Date-Range-Picker-In-Top v-model="dateRangeInReport2" class="m-l report2-date-range"></Date-Range-Picker-In-Top>
    </div>
  </div>
</template>

<script>
import MapFilters from '@/components/MapFilters.vue'
import DateRangePickerInTop from '@/components/DateRangePickerInTop.vue'
import Select2 from '@/components/Select2.vue'

export default {
  components: { MapFilters, DateRangePickerInTop, Select2 },
  // data() {
  //   return {
  //
  //   }
  // },
  computed: {
    dateRangeInD2: {
      get() { return this.$store.state.dateRangeInD2 },
      set(value) { this.$store.commit('dateRangeInD2', value) },
    },
    report2DriverId: {
      get() { return this.$store.state.report2DriverId },
      set(value) { this.$store.commit('report2DriverId', value) },
    },
    dateRangeInReport2: {
      get() { return this.$store.state.dateRangeInReport2 },
      set(value) { this.$store.commit('dateRangeInReport2', value) },
    },
  },
  // methods:
}
</script>
<style lang="scss">
</style>
