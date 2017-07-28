<template>
<div class="">
  <md-button class="md-icon-button md-primary md-dense" @click.native="store.$emit('edit', row)">
    <md-icon>edit</md-icon>
    <md-tooltip md-direction="bottom">Edit</md-tooltip>
  </md-button>
  <md-button class="md-icon-button md-accent md-dense" @click.native="store.$emit('remove', row)">
    <md-icon>remove_circle</md-icon>
    <md-tooltip md-direction="bottom">Remove</md-tooltip>
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
