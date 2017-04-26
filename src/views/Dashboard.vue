<template lang="pug">
ContentBase(:title="title")
  .alert.alert-info Welccome {{$store.state.user.name}}
</template>
<script>
import ContentBase from '@/components/content/Base.vue'
export default {
  components: { ContentBase },
  data() {
    return {
      title: 'Dashboard'
    }
  }
}
</script>
<style lang="scss">
</style>
