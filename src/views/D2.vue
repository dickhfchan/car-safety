<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 class="md-title">D2</h2>

      <div class="relative">
        <Paginator :source="rows" :page-size="pageSize">
            <template scope="page">
              <datatable
                  :source="page.data"
                  :editable="false"
                  :line-numbers="false"
                  :filterable="false"
                  class="table1"
                  >
                  <datatable-column
                      v-for="column in columns"
                      :key="column.name"
                      v-if="column.visible"
                      :id="column.name"
                      :label="column.text"
                      :width="column.width"
                      :sortable="column.sortable"
                      :groupable="column.groupable"
                      :formatter="column.formatter">
                  </datatable-column>
              </datatable>
            </template>
        </Paginator>
        <div class="absolute-backdrop center-wrapper" v-show="loading">
          <md-spinner md-indeterminate></md-spinner>
        </div>
      </div>

      <div class="card-buttons">
        <md-button class="md-icon-button" @click.native="exportExcel">
          <md-icon>get_app</md-icon>
          <md-tooltip md-direction="bottom">Export</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.native="getData()">
          <md-icon>refresh</md-icon>
          <md-tooltip md-direction="bottom">Refresh</md-tooltip>
        </md-button>
        <fullscreen-button></fullscreen-button>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
import { Datatable, DatatableColumn } from '@/components/datatable'
import Paginator from '../../node_modules/vuetiful/src/components/paginator/paginator.vue'
import { retry } from 'helper-js'
import { initColumns, generateExcel } from '../utils.js'

export default {
  components: { Datatable, DatatableColumn, Paginator },
  data() {
    return {
      columns: [
        { name: 'vrm_grp_id', text: 'Group' },
        { name: 'total_score',
          text: 'Total',
        },
        { name: 'pcw',
          text: 'PCW',
        },
        { name: 'hmw_h',
          text: 'HMW_H',
        },
        { name: 'hmw_m',
          text: 'HMW_M',
        },
        { name: 'hmw_l',
          text: 'HMW_L',
        },
        { name: 'fcw',
          text: 'FCW',
        },
        { name: 'ufcw',
          text: 'UFCW',
        },
        { name: 'lldw',
          text: 'LLDW',
        },
        { name: 'rldw',
          text: 'RLDW',
        },
        { name: 'spw',
          text: 'SPW',
        },
        { name: 'aaw',
          text: 'AAW',
        },
        { name: 'abw',
          text: 'ABW',
        },
        { name: 'atw',
          text: 'ATW',
        },
        { name: 'drv_distance',
          text: 'Distance Travelled',
        },
      ],
      rows: [],
      pageSize: 20,
    }
  },
  created() {
    //
    initColumns(this, this.columns)
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      retry(() => this.$http.get('dao/avg_warning_vrm_grp'))()
      .then(({data}) => {
        this.loading = false
        this.rows = data.JSON
      }).catch((e) => {
        this.loading = false
        this.$alert('load failed')
        throw e
      })
    },
    exportExcel() {
      const cols = this.columns
      const data = this.rows.map(row => {
        const r = []
        cols.forEach(col => {
          const val = row[col.name]
          r.push(col.formatter ? col.formatter(val) : val)
        })
        return r
      })
      const titleLabels = cols.map(col => col.text)
      generateExcel(data, 'D2', titleLabels)
    }
  }
}
</script>
<style lang="scss">
.table1{
  &.table-wrapper{
    border: none;
  }
}
</style>
