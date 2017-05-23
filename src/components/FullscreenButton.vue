<template>
  <md-button class="md-icon-button fullscreen-button" @click.native="toggleFullscreen()">
    <md-icon>{{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}}</md-icon>
    <md-tooltip v-if="isFullscreen" md-direction="bottom">{{$t('exitFullscreen')}}</md-tooltip>
    <md-tooltip v-else md-direction="bottom">{{$t('fullscreen')}}</md-tooltip>
  </md-button>
</template>
<script>
import { findParent, hasClass } from 'helper-js'

function addClass(el, className) {
  if (el.classList)
    { el.classList.add(className) }
  else
  { el.className += ' ' + className }
}

function removeClass(el, className) {
  if (el.classList)
    { el.classList.remove(className) }
  else
  { el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ') }
}

export default {
  data() {
    return {
      isFullscreen: false
    }
  },
  methods: {
    toggleFullscreen(to) {
      // get card and content
      const card = findParent(this.$el, el => hasClass(el, 'md-card'))
      const cardContent = card && card.querySelector('.md-card-content')
      if (card) {
        this.isFullscreen = to == null ? !this.isFullscreen : to
        if (this.isFullscreen) {
          addClass(card, 'fullscreen')
          addClass(card, 'fullscreen-layer')
          addClass(cardContent, 'fullscreen-card-content')
        } else {
          removeClass(card, 'fullscreen')
          removeClass(card, 'fullscreen-layer')
          removeClass(cardContent, 'fullscreen-card-content')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.fullscreen{
  position: fixed!important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  margin: 0!important;
}
.fullscreen-card-content{
  flex: 1;
}
</style>
