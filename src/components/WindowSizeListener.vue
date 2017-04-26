<script>
export default {
  data: function() {
    return {
      window: {
        width: window.innerWidth,
        height: window.innerHeight,
        oldWidth: 0,
        oldHeight: 0
      }
    }
  },
  methods: {
    updateWindow: function() {
      return Object.assign(this.window, {
        width: window.innerWidth,
        height: window.innerHeight,
        oldWidth: this.window.width,
        oldHeight: this.window.height
      })
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.updateWindow()
      window.addEventListener('resize', this.updateWindow)
    })
  },
  beforeDestroy: function() {
    window.removeEventListener('resize', this.updateWindow)
  }
}

</script>
