<template>
  <div class="datatable-footer md-table-card">
    <div class="md-table-pagination">
      <span class="md-table-pagination-label">Rows:</span>
      <md-select v-model="pageSize">
        <md-option :value="10">10</md-option>
        <md-option :value="30">30</md-option>
        <md-option :value="100">100</md-option>
     </md-select>
      <span>{{(page - 1) * pageSize + 1}}-{{page * pageSize <= total ? (page * pageSize) : total}} of {{total}}</span>
      <Pagination class="m-l" :total.sync="toal" :page.sync="page" :page-Size.sync="pageSize"></Pagination>
    </div>
  </div>
</template>
<script>
export default {
  props: ['total', 'page', 'pageSize'],
  // components:
  data() {
    return {

    }
  }
  // methods:
}
</script>
<style lang="scss">
</style>
