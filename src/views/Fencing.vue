<template>
  <div class="fencing">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('fencing')}}</h2>

        <div class="relative flex-1 overflow-hidden-y">
          <div class="map-wrapper">
            <Baidu-Map-Fencing ref="bmf" :ak="$store.state.baiduMapAK" class="w-100 h-100"></Baidu-Map-Fencing>
          </div>
          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
          <form novalidate @submit.prevent="checkFence" class="check">
            <md-input-container>
              <label>Longitude</label>
              <md-input type="number" v-model="checkPoints.lng"></md-input>
            </md-input-container>
            <md-input-container>
              <label>Latitude</label>
              <md-input type="number" v-model="checkPoints.lat"></md-input>
            </md-input-container>
            <md-button type="submit" class="md-raised md-primary">Check</md-button>
          </form>
        </div>

        <div class="card-buttons">
          <fullscreen-button @click.native="onMapCardFullscreen"></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
import BaiduMapFencing from '../components/BaiduMapFencing.vue'
export default {
  components: { BaiduMapFencing },
  data() {
    return {
      title: this.$t('fencing'),
      checkPoints: {
        lng: 116.404,
        lat: 39.915,
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    checkFence() {
      this.$refs.bmf.isInFence(this.checkPoints.lng, this.checkPoints.lat)
    }
  }
}
</script>
<style lang="scss">
.fencing{
  .map-wrapper{
    height: 600px;
  }
  .check{
    .md-input-container {
      width: 300px;
      display: inline-block;
      margin-left: 10px;
    }
    .md-button {
      vertical-align: baseline;
    }
  }
}
</style>
