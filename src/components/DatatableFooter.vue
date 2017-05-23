<template>
  <div class="datatable-footer md-table-card">
    <div class="md-table-pagination">
      <span class="md-table-pagination-label">{{$t('rows')}}:</span>
      <md-select v-model="pageSize">
        <md-option :value="10">10</md-option>
        <md-option :value="30">30</md-option>
        <md-option :value="100">100</md-option>
     </md-select>
      <span class="m-r" >{{start}}-{{end}} of {{rows.length}}</span>
      <Pagination class="m-r" v-show="totalPages > 1" :total="totalPages" :page="page" @pagination="page=$event"></Pagination>
    </div>
  </div>
</template>
<script>
import Pagination from './Pagination.vue'
export default {
  props: {
    rows: { default: is => [] }
  },
  components: { Pagination },
  data() {
    return {
      page: 1,
      pageSize: 30,
    }
  },
  computed: {
    total() { return this.rows.length },
    totalPages() { return Math.ceil(this.total / this.pageSize) },
    start() { return (this.page - 1) * this.pageSize + 1 },
    end() {
      const t = this.page * this.pageSize
      return t <= this.total ? t : this.total
    }
  },
  watch: {
    rows() { this.updateRowVisibility() },
    pageSize() { this.updateRowVisibility() },
    page() { this.updateRowVisibility() },
  },
  methods: {
    updateRowVisibility() {
      this.rows.forEach((row, i) => {
        row.visible = i >= this.start && i <= this.end
      })
    }
  },
  created() {
    this.updateRowVisibility()
  }
}
</script>
<style lang="scss">
</style>
