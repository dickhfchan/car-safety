<template>
  <div class="">
    <BaiduMapTrackRender ak="0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG" :points="points"></BaiduMapTrackRender>
  </div>
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

<style>
</style>
