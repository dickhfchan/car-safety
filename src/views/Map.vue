<template>
  <md-layout md-gutter>
    <md-layout md-flex>
      <md-card style="flex:1">
        <md-card-header>
          <div class="md-title">Baidu Map</div>
        </md-card-header>
        <md-card-content>
          <BaiduMapTrackRender ak="0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG" :points="points"></BaiduMapTrackRender>
        </md-card-content>
      </md-card>
    </md-layout>
  </md-layout>
</template>

<script>
import BaiduMapTrackRender from 'baidu-map-track-render-vue/src/BaiduMapTrackRender.vue'

export default {
  components: {
    BaiduMapTrackRender
  },
  data() {
    return {
      points: [
        [116.399, 39.910],
        [116.405, 39.920],
        [116.423493, 39.907445]
      ]
    }
  }
  // methods:
}
</script>

<style scoped>
.md-card{
  margin: 1em;
}
</style>
