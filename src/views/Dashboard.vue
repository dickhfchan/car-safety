<template>
  <div class="">
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: this.$t('dashboard')
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
}
</script>
<style lang="scss">
</style>
