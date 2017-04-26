<template>
  <div>
  <h1>This is the name</h1>
    <radial-gauge :options="{ value: 233 }"></radial-gauge>
    <linear-gauge :value="377"></linear-gauge>
  </div>
</template>

<script>
import RadialGauge from 'vue-canvas-gauges/src/RadialGauge.vue'
import LinearGauge from 'vue-canvas-gauges/src/LinearGauge.vue'

export default {
  components: {
    RadialGauge,
    LinearGauge
  }
}
</script>
