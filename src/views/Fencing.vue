<template>
  <div class="fencing">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('fencing')}}</h2>

        <div class="relative flex-1 overflow-hidden-y map-wrapper">
          <Baidu-Map-Fencing :ak="$store.state.baiduMapAK" class="w-100 h-100"></Baidu-Map-Fencing>
          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
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
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  // methods:
}
</script>
<style lang="scss">
.fencing{
  .map-wrapper{
    height: 600px;
  }
}
</style>
