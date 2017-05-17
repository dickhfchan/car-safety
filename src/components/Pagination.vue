<template>
  <div class="pagination pagination-sm">
    <div class="md-button-toggle md-primary md-theme-default">
      <md-button class="md-icon-button" v-if="page > 1" @click.native="goto(page-1)">
        <md-icon>keyboard_arrow_left</md-icon>
      </md-button>
      <md-button class="md-icon-button btn-more" v-if="btns[0] && btns[0].page > 1" @click.native="goto(btns[0].page-1)">
        <md-icon>more_horiz</md-icon>
      </md-button>
      <md-button class="md-icon-button" v-for="(item, index) in btns" :key="index" :class="{'md-toggle': item.page == page}" @click.native="goto(item.page)">
        {{item.text}}
      </md-button>
      <md-button class="md-icon-button btn-more" v-if="btns[btns.length-1] && btns[btns.length-1].page < total" @click.native="goto(btns[btns.length-1].page+1)">
        <md-icon>more_horiz</md-icon>
      </md-button>
      <md-button class="md-icon-button" v-if="page < total" @click.native="goto(page+1)">
        <md-icon>keyboard_arrow_right</md-icon>
      </md-button>
    </div>
 </md-input-container>
  </div>
</template>
<script>
export default {
  props: {
    page: { default: 1 },
    total: { default: 0 },
    btnCount: { default: 5 },
  },
  // components:
  data() {
    return {

    }
  },
  computed: {
    btns() {
      if (this.page > this.total) {
        return []
      }
      const left = []
      const right = []
      const current = { page: this.page, text: this.page }
      let leftIndex = parseInt(this.page)
      let rightIndex = parseInt(this.page)
      let rest = this.btnCount - 1
      let side = true // left or right
      while (rest > 0 && (leftIndex >= 1 || rightIndex <= this.total)) {
        if (side) {
          side = !side
          leftIndex--
          if (leftIndex >= 1) {
            rest--
            left.splice(0, 0, {
              page: leftIndex,
              text: leftIndex
            })
          }
        } else {
          side = !side
          rightIndex++
          if (rightIndex <= this.total) {
            rest--
            right.push({
              page: rightIndex,
              text: rightIndex
            })
          }
        }
      }
      return [...left, current, ...right]
    }
  },
  methods: {
    goto(page) {
      this.$emit('pagination', page)
    }
  }
}
</script>
<style lang="scss">
.pagination{
  .btn-more{
    color: rgba(0,0,0,.54)!important;
  }
}
.pagination-sm{
  .md-button{
    padding: 0px;
    min-width: inherit;
    min-height: inherit;
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-weight: normal;
  }
}
</style>
