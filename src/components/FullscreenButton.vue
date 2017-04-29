<template>
  <md-button class="md-icon-button fullscreen-button" @click.native="toggleFullscreen">
    <md-icon>fullscreen</md-icon>
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
      isFullscreen: false,
    }
  },
  mounted() {
    this.$nextTick(() => {
      // add class to parentElement
      const parent = this.$el.parentElement
      parent && addClass(parent, 'fullscreen-button-wrapper')
    })
  },
  methods: {
    toggleFullscreen() {
      // get card and content
      const card = findParent(this.$el, el => hasClass(el, 'md-card'))
      const cardContent = card && card.querySelector('.md-card-content')
      if (card) {
        this.isFullscreen = !this.isFullscreen
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
.fullscreen-button-wrapper{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
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
