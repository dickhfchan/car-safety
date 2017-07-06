<template>
  <div class="fencing">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('fencing')}}</h2>

        <div class="relative flex-1 overflow-hidden-y">
          <div class="map-wrapper">
            <Baidu-Map-Fencing ref="bmf" :ak="$store.state.baiduMapAK" @changed="changed=true" class="w-100 h-100"></Baidu-Map-Fencing>
          </div>
          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
          <form novalidate @submit.prevent="checkFence" class="check">
            <md-button class="md-raised md-primary" :disabled="!changed" @click.native="save">Save</md-button>

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
import { axiosAutoProxy } from '@/utils.js'

export default {
  components: { BaiduMapFencing },
  data() {
    return {
      title: this.$t('fencing'),
      changed: false,
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
    },
    save() {
      const { fence } = this.$refs.bmf
      const temp = {}
      if (fence.hasOwnProperty('xa')) {
        // circle
        temp.xa = fence.xa
        temp.point = { lat: fence.point.lat, lng: fence.point.lng }
      } else {
        // polygon
        temp.points = fence.po.map(p => { return { lat: p.lat, lng: p.lng } })
      }
      axiosAutoProxy(this.$http, 'dao/ui_geofence_setup', 'post', {
        company_id: this.$store.state.user.company.company_id,
        created_by: this.$store.state.user.user_id,
        fence_baidu: temp,
        fence: null,
      }).then(({data}) => {
        this.changed = false
        console.log(data)
        if (data === 'error') {
          this.$alert('Save Failed')
        } else if (data.toLowerCase().indexOf('succe') === -1) {
          this.$alert(data)
        } else {
          this.$alert(data)
          this.getData()
          this.$refs.dialogAdd.close()
        }
      })
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
