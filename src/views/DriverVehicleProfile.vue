<template>
  <div class="driver-vehicle-profile">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('driverVehicleProfile')}}</h2>

        <div class="absolute-backdrop center-wrapper" v-show="!isSelected">
          <span class="md-title">No driver or vehicle selected</span>
        </div>

        <template v-if="isSelected">
          <div v-if="state.type==='driver'" class="profile driver-profile">
            <div class="avatar">
              <img src="../assets/img/avatar-2.jpg" alt="" />
            </div>
            <div class="information">
              <h3 >{{driver.name}}</h3>
              Phone home: {{driver.phone_home}}
              <br />
              Phone mobile: {{driver.phone_mobile}}
              <br />
              Travelled distance: {{driver.travelledDistance}} KM
            </div>
          </div>
          <div v-if="state.type==='vehicle'" class="profile vehicle-profile">
            <div class="avatar">
              <img src="../assets/img/avatar-2.jpg" alt="" />
            </div>
            <div class="information">
              <h3 >{{vehicle.vrm_mark_code}}</h3>
              Travelled distance: {{vehicle.travelledDistance}} KM
            </div>
          </div>
        </template>

        <div class="absolute-backdrop center-wrapper" v-show="loading">
          <md-spinner md-indeterminate></md-spinner>
        </div>

        <!-- <div class="relative flex-1 overflow-hidden-y">
        </div> -->

        <div class="card-buttons">
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
const md = 'driverVehicleProfile' // vuex module name

export default {
  // components:
  data() {
    return {
      // driverInfo: {},
      // vehicleInfo: {},
      loading: false,
    }
  },
  computed: {
    state() { return this.$store.state.driverVehicleProfile },
    isSelected() { return (this.state.type === 'driver' && this.state.driver) || (this.state.type === 'vehicle' && this.state.vehicle) },
    driver() { return this.$store.getters[`${md}/driverObj`] },
    vehicle() { return this.$store.getters[`${md}/vehicleObj`] },
  },
  // methods:
}
</script>
<style lang="scss">
.driver-vehicle-profile{
  .profile{
    display: flex;
    margin-bottom: 20px;
    > .avatar{
      padding: 0 20px 0 5px;
    }
    > .information{

    }
  }
}
</style>
