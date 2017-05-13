<template>
  <div class="">
    <h1>home</h1>
    <router-link :to="{name: 'users'}">users</router-link>
    <router-link :to="{name: 'gauge'}">gauge</router-link>
    <router-link :to="{name: 'plotly'}">plotly</router-link>
    <router-link :to="{name: 'map'}">map</router-link>
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: 'Dashboard'
    }
  }
}
</script>
<style lang="scss">
</style>
