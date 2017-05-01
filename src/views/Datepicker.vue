<template>
  <div class="p-a h-100 flex">
    <md-card class="flex-1">
      <md-card-header>
        <h3 class="md-title">Datepicker<fullscreen-button></fullscreen-button></h3>
      </md-card-header>
      <md-card-content style="flex:1;">
        <datepicker v-model="date"></datepicker>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
  import datepicker from 'vue-date'
  export default {
    data() {
      return {
        date: '2016-10-16'
      }
    },
    components: { datepicker }
  }
</script>
