<template>
  <div class="fencing">
    <md-card  class="m-a card-1">
      <md-card-content class="flex flex-col">
        <h2 class="md-title">{{$t('fencing')}}</h2>

        <div class="relative flex-1 overflow-hidden-y">
          <div class="map-wrapper">
            <Baidu-Map-Fencing ref="bmf" :ak="$store.state.baiduMapAK" @changed="onChanged" class="w-100 h-100"></Baidu-Map-Fencing>
          </div>
          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
          {{fence}}
          <form novalidate @submit.prevent="checkFence" class="check">
            <md-input-container>
              <label>{{$t('remark')}}</label>
              <md-input type="text" v-model="remark" @input="changed=true"></md-input>
            </md-input-container>
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
      },
      fence: {},
      remark: '',
    }
  },
  computed: {
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
      // this.getAndRenderFence()
    })
  },
  methods: {
    onChanged() {
      this.changed = true
      this.getFence()
    },
    checkFence() {
      this.$refs.bmf.isInFence(this.checkPoints.lng, this.checkPoints.lat)
    },
    // get the first matched fence to display
    getAndRenderFence() {
      this.$http.get('dao/ui_geofence_setup').then(({data}) => {
        const user = this.$store.state.user
        const fenceData = data.JSON.find(item => item.company_id === user.company.company_id && parseInt(item.create_user) === user.user_id)
        if (fenceData) {
          this.fenceData = fenceData
          this.fence = JSON.parse(fenceData.geofence)
          this.$refs.bmf.render(this.fence)
          this.remark = fenceData.remark
        }
      })
    },
    save() {
      axiosAutoProxy(this.$http, 'dao/ui_geofence_setup', 'post', {
        geofence_id: (this.fenceData && this.fenceData.geofence_id) || null,
        company_id: this.$store.state.user.company.company_id,
        create_user: this.$store.state.user.user_id.toString(),
        geofence: JSON.stringify(this.fence),
        geofence_baidu: JSON.stringify(this.fence),
        remark: this.remark,
      }).then(({data}) => {
        this.changed = false
        if (data.toLowerCase().indexOf('success') > -1) {
          this.$alert(this.$t('succeeded'))
        } else {
          this.$alert(data)
        }
      }).catch(e => {
        this.$alert(this.$t('errorRefreshOrFeedback'))
        throw e
      })
    },
    getFence() {
      const temp = {}
      const { fence } = this.$refs.bmf
      if (fence.hasOwnProperty('xa')) {
        // circle
        temp.xa = fence.xa
        temp.point = { lat: fence.point.lat, lng: fence.point.lng }
      } else {
        // polygon
        temp.points = fence.po.map(p => { return { lat: p.lat, lng: p.lng } })
      }
      this.fence = temp
    },
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
