<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 class="md-title">Analysis Group</h2>

      <Paginator :source="rows" :page-size="pageSize">
          <template scope="page">
            <datatable
                :source="page.data"
                :editable="false"
                :line-numbers="true"
                :filterable="false"
                class="analysis-group-table"
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

      <div class="card-buttons">
        <md-switch class="md-primary" v-model="scoreColumnVisible">Score Column</md-switch>
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
import { format } from 'date-functions'
import { initColumns, generateExcel } from '../utils.js'

export default {
  components: { Datatable, DatatableColumn, Paginator },
  data() {
    return {
      columns: [
        { name: 'vrm_grp_id' },
        { name: 'total_score',
          text: 'Total',
        },
        { name: 'pcw_score',
          text: 'PCW S',
        },
        { name: 'ufcw_score',
          text: 'UFCW S',
        },
        { name: 'fcw_score',
          text: 'FCW S'},
        { name: 'hmw_h_score',
          text: 'HMW_H S'},
        { name: 'hmw_m_score',
          text: 'HMW_M S'},
        { name: 'hmw_l_score',
          text: 'HMW_L S'},
        { name: 'lldw_score',
          text: 'LLDW S'},
        { name: 'rldw_score',
          text: 'RLDW S'},
        { name: 'spw_score',
          text: 'SPW S',
        },
        { name: 'vb_score',
          text: 'VB S',
        },
        { name: 'aaw_score',
          text: 'AAW S',
        },
        { name: 'abw_score',
          text: 'ABW S',
        },
        { name: 'atw_score',
          text: 'ATW S',
        },
        { name: 'drv_distance',
          text: 'Distance',
        },
        { name: 'drv_duration',
          text: 'Duration',
        },
        { name: 'pcw',
          text: 'PCW',
        },
        { name: 'ufcw',
          text: 'UFCW',
        },
        { name: 'fcw',
          text: 'FCW',
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
        { name: 'lldw',
          text: 'LLDW',
        },
        { name: 'rldw',
          text: 'RLDW',
        },
        { name: 'spw',
          text: 'SPW',
        },
        { name: 'vb',
          text: 'VB',
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
        {
          name: 'start_date',
          formatter: (val) => format(new Date(val), 'MM-dd HH:mm')
        },
        { name: 'end_date',
          formatter: (val) => format(new Date(val), 'MM-dd HH:mm')
        },
        { name: 'type' },
        { name: 'avg_warn_id' },
      ],
      rows: [],
      pageSize: 20,
      cache: {
        scoreColumnVisible: false,
      }
    }
  },
  computed: {
    scoreColumnVisible: {
      get() { return this.cache.scoreColumnVisible },
      set() {
        this.cache.scoreColumnVisible = !this.cache.scoreColumnVisible
        this.columns.forEach(col => {
          if (col.name.indexOf('_score') > -1) {
            col.visible = this.scoreColumnVisible
          }
        })
      }
    }
  },
  created() {
    //
    initColumns(this, this.columns)
    this.getData()
  },
  methods: {
    getData() {
      retry(() => this.$http.get('dao/avg_warning_vrm_grp'))()
      .then(({data}) => {
        this.rows = data.JSON
      }).catch((e) => {
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
      generateExcel(data, 'Analysis Group', titleLabels)
    }
  }
}
</script>
<style lang="scss">
.analysis-group-table{
  &.table-wrapper{
    border: none;
  }
}
</style>
