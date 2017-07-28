<template>
  <div class="data-table">
    <div class="md-table md-theme-default">
      <table>
        <thead class="md-table-header">
          <tr class="md-table-row1">
            <th class="md-table-head " v-for="col in columns" v-if="col.visible" :key="col.name"
            :class="{'md-sortable': col.sortAble, 'md-sorted': col.sortAble && sort.name === col.name}"
            @click="onSort(col)"
            >
              <div class="md-table-head-container">
                <div class="md-table-head-text md-test">
                  <md-icon class="md-sortable-icon" v-if="col.sortAble">
                    {{sortIcon(col)}}
                  </md-icon>
                  {{col.text}}
                </div>
                <!-- <div class="md-ink-ripple">
                  <div class="md-ripple"></div>
                </div> -->
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="md-table-body">
          <tr class="md-table-row" v-for="row in rows" :key="primaryKeyColumn ? row[primaryKeyColumn.name] : null" v-if="row.visible"
          :class="{active: row.active}">
            <td class="md-table-cell" v-for="col in columns" v-if="col.visible" :key="col.name">
              <div class="md-table-cell-container" v-if="col.type==='default'">
                {{row[col.name]}}
              </div>
              <component v-else :is="col.cellComponent || (col.type + '-Cell')" :row="row" :col="col" :store="store"
                :class="col.cellClass" :style="col.cellStyle" v-bind="col.cellAttrs"
                @click.native="$emit('clickCell', {value: row[col.name], row, col, store})"></component>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Data-Table-Footer v-if="pagination" :rows="rows"></Data-Table-Footer>
  </div>
</template>

<script>
import { initRows, initColumns, sortRows } from '@/utils.js'
import DataTableFooter from './DataTableFooter.vue'
export default {
  components: { DataTableFooter },
  props: {
    rows: {},
    columns: {},
    sortBy: {},
    sortType: {},
    pagination: { default: false },
  },
  data() {
    return {
      sort: { name: null, type: null },
      store: this,
    }
  },
  computed: {
    primaryKeyColumn() { return this.columns.find(col => col.primaryKey) },
    computedSortType() { return this.sort.type === 'asc' ? 'asc' : 'desc' },
  },
  watch: {
    rows: {
      immediate: true,
      handler(n, o) {
        if (n === o) return
        this.initRows()
        this.doSort()
      },
    },
    columns: {
      immediate: true,
      handler(n, o) {
        if (n === o) return
        this.initColumns()
        if (this.rows && this.rows.length > 0) {
          this.initRows()
          this.doSort()
        }
      },
    },
    sortBy: {
      immediate: true,
      handler(val) {
        this.sort.name = val
      },
    },
    sortType: {
      immediate: true,
      handler(val) {
        this.sort.type = val
      },
    },
  },
  methods: {
    initRows() { initRows(this, this.rows, this.columns) },
    initColumns() { initColumns(this, this.columns) },
    doSort() {
      if (this.sort.name && this.columns && this.columns.find(col => col.name === this.sort.name)) {
        sortRows({name: this.sort.name, type: this.computedSortType}, this.rows, this.columns)
      }
    },
    // support single column only
    onSort(col) {
      if (col.sortAble) {
        if (this.sort.name !== col.name) {
          this.sort.type = 'desc'
        } else {
          this.sort.type = this.sort.type === 'asc' ? 'desc' : 'asc'
        }
        this.sort.name = col.name
        this.doSort()
      }
    },
    sortIcon(col) {
      if (this.sort.name === col.name) {
        return this.computedSortType === 'desc' ? 'arrow_downward' : 'arrow_upward'
      } else {
        return 'arrow_downward'
      }
    },
  },
}
</script>
<style lang="scss">
</style>
