<template>
  <div class="relative select2">
    <div class="value-arrow-wrapper" @click="dropVisible = !dropVisible">
      <div class="arrow-wrapper">
        <md-icon class="arrow">arrow_drop_down</md-icon>
      </div>
      <span class="value-text">{{(valueItem && valueItem[textKey]) || '&nbsp;'}}</span>
      <span class="arrow-holder"></span>
    </div>
    <div class="drop-down popup-layer" v-show="dropVisible">
      <div class="search-wrapper">
        <input type="text" class="search" v-model="search" ref="search">
      </div>
      <div class="items">
        <div class="item" v-for="item in filteredOptions" :class="{active: item === valueItem}" @click="onClickItem(item)">
          {{item[textKey]}}
        </div>
        <div class="no-results" v-show="!filteredOptions || filteredOptions.length === 0">
          No results found
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { isDescendantOf } from 'helper-js'
export default {
  // components:
  props: {
    options: {},
    textKey: {},
    valueKey: {},
    value: {},
  },
  data() {
    return {
      search: null,
      dropVisible: false
    }
  },
  computed: {
    valueItem() { return this.options.find(v => v[this.valueKey] === this.value) },
    filteredOptions() {
      if (this.search) {
        const reg = new RegExp('^' + this.search, 'i')
        return this.options.filter(item => reg.test(item[this.textKey]))
      } else {
        return this.options
      }
    }
  },
  watch: {
    dropVisible() {
      if (this.dropVisible) {
        try {
          this.$refs.search.focus()
        } catch (e) {}
      } else {
        this.search = null
      }
    }
  },
  methods: {
    listener(e) {
      if (this.dropVisible) {
        const target = e.target
        const clickOutside = target !== this.$el && !isDescendantOf(target, this.$el)
        if (clickOutside) {
          this.dropVisible = false
        }
      }
    },
    onClickItem(item) {
      this.$emit('input', item[this.valueKey])
      this.dropVisible = false
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      document.addEventListener('click', this.listener)
    })
  },
  beforeDestroy: function() {
    document.removeEventListener('click', this.listener)
  }
}
</script>
<style lang="scss">
.select2{
  .value-arrow-wrapper{
    display: flex;
    align-items: center;
    border-bottom: 1px solid #fff;
    cursor: pointer;
    color: #fff;
  }
  .arrow-holder{
    width: 1.5em;
  }
  .arrow-wrapper{
    width: 100%;
    height: 100%;
    position: absolute;
    text-align: right;
    right: -7px;
    top: -2px;
  }
  .arrow{
    font-size: 18px;
  }
  .value-text{
    white-space: nowrap;
  }
  .drop-down{
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    border: 1px solid #ccc;
    color: #000;
    .search-wrapper{
      padding: 3px;
    }
    .search {
      padding: 3px;
      border: 1px solid #2196f3;
    }
    .items{
      max-height: 300px;
      overflow: auto;
      .item{
        padding: 5px 10px;
        cursor: pointer;
        &:hover:not(.active){
          background-color: hsla(0,0%,60%,.2);
        }
        &.active{
          background-color: #2196f3;
          color: #fff;
        }
      }
    }
    .no-results{
      padding: 5px 10px;
    }
  }
}
</style>
