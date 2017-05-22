<template>
  <div class="date-range-picker-in-top">
   <label class="m-r-sm">Date Range</label>
   <date-picker class="date-picker" v-model="dateRange" :language="$store.state.lang == 'en' ? 'en' : 'ch'" :range="true"></date-picker>
  </div>
</template>
<script>
import DatePicker from './DatePicker.vue'
export default {
  components: {
    DatePicker
  },
  props: {
    value: {}
  },
  data() {
    return {
    }
  },
  computed: {
    dateRange: {
      get() { return this.value },
      set(value) { this.$emit('input', value) }
    },
  }
  // methods:
}
</script>
<style lang="scss">
.date-range-picker-in-top{
  display: flex;
  align-items: center;
  label{
    white-space: nowrap;
  }
  .date-picker{
    width: 180px;
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
