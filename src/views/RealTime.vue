<template>
  <div class="">
    <md-card  class="m-a card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('realTime')}}</h2>

        <div class="relative overflow-hidden-y">

          <!-- <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div> -->
        </div>

        <div class="card-buttons">
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
export default {
  // components:
  data() {
    return {
      title: this.$t('realTime'),
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  // methods:
}
</script>

<style lang="scss">
</style>
