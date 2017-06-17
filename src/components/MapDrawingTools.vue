<template>
  <div class="md-button-toggle md-primary box-1 map-drawing-tools md-theme-default">
    <md-button v-for="(btn, key) in btns" :class="['md-icon-button', {'md-toggle': btn === selected}]" @click.native="onclickBtn(key, btn)">
      <md-icon v-if="key!='polygon'">{{btn.icon}}</md-icon>
      <md-icon v-else :md-src="btn === selected ? btn.icon.white : btn.icon.normal"></md-icon>
    </md-button>

    <md-button class="md-icon-button" @click.native="$parent.removeFence()">
      <md-icon>clear</md-icon>
    </md-button>
  </div>
</template>
<script>
import polygon from '../assets/map-drawing-tool-icon/polygon.png'
import polygonWhite from '../assets/map-drawing-tool-icon/polygon-white.png'

export default {
  // components:
  data() {
    return {
      btns: {
        drag: {
          icon: 'open_with',
          click: () => { this.$parent.drawingManager.close() },
        },
        circle: {
          icon: 'radio_button_unchecked',
          click: () => { this.$parent.drawingManager.open(); this.$parent.drawingManager.setDrawingMode(window.BMAP_DRAWING_CIRCLE) }
        },
        rectangle: {
          icon: 'check_box_outline_blank',
          click: () => { this.$parent.drawingManager.open(); this.$parent.drawingManager.setDrawingMode(window.BMAP_DRAWING_RECTANGLE) }
        },
        polygon: {
          icon: {
            normal: polygon,
            white: polygonWhite,
          },
          click: () => { this.$parent.drawingManager.open(); this.$parent.drawingManager.setDrawingMode(window.BMAP_DRAWING_POLYGON) }
        }
      },
      selectedKey: 'drag',
    }
  },
  computed: {
    selected() { return this.btns[this.selectedKey] },
    map() { return !this.$parent.BMapApiLoading && this.$parent.map },
  },
  created() {
  },
  methods: {
    onclickBtn(key, btn) {
      this.selectedKey = key
      btn.click()
    }
  },
}
</script>
<style lang="scss">
.map-drawing-tools{
  background: #fff;
}
</style>
