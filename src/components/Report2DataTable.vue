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
            <td class="md-table-cell" v-for="col in columns" v-if="col.visible" :key="col.name" :style="report2.getColorStyle(report2.rows1, row, col)">
              <div class="md-table-cell-container" v-if="col.type==='default'">
                {{row[col.name]}}
              </div>
              <component v-else class="md-table-cell-container"
               :is="col.cellComponent || (col.type + '-Cell')" :row="row" :col="col" :store="store"
               :class="col.cellClass" :style="col.cellStyle" v-bind="col.cellAttrs"
                ></component>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Data-Table-Footer v-if="pagination" :rows="rows"></Data-Table-Footer>
  </div>
</template>
<script>
import DataTable from './DataTable.vue'
export default {
  // components:
  extends: DataTable,
  props: {
    report2: {}
  },
  data() {
    return {

    }
  },
}
</script>
<style lang="scss">
</style>
