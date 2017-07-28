<template>
<div class="">
  <md-button class="md-icon-button md-primary md-dense" @click.native="store.$emit('edit', row)">
    <md-icon>edit</md-icon>
  </md-button>
  <md-button class="md-icon-button md-accent md-dense" @click.native="store.$emit('remove', row)">
    <md-icon>remove_circle</md-icon>
  </md-button>
</div>
</template>
<script>
export default {
  // components:
  props: {
    row: {},
    col: {},
    store: {},
  },
  data() {
    return {

    }
  }
  // methods:
}
</script>
<style lang="scss">
</style>
