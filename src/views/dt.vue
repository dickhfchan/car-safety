<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 class="md-title">Analysis</h2>
      <div class="relative">

        <md-table :md-sort="'vrm_id'" md-sort-type="desc" @select="" @sort="onSort">
         <md-table-header>
           <md-table-row>
             <md-table-head v-for="col in columns" :md-sort-by="col.name">{{col.text}}</md-table-head>
           </md-table-row>
         </md-table-header>

         <md-table-body>
           <md-table-row v-for="row in rows" :key="row.vrm_id" :md-item="row" md-auto-select md-selection>
             <md-table-cell v-for="col in columns" :key="col.name">
               {{ row[col.name] }}
             </md-table-cell>
           </md-table-row>
         </md-table-body>
       </md-table>
      </div>

      <div class="card-buttons">
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
import Pagination from '../components/Pagination.vue'

export default {
  components: { Datatable, DatatableColumn, Paginator, Pagination },
  data() {
    return {
      columns: [
        { name: 'vrm_id' },
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
      rows: [
        {vrm_id: 1},{vrm_id: 2},{vrm_id: 3}
      ],
      total: 3,
      page: 1,
      pageSize: 30,
      //
      cache: {
        scoreColumnVisible: false,
      },
    }
  },
  created() {
    //
    initColumns(this, this.columns)
  },
  methods: {
    onSort(obj) {
      const rows = this.rows.sort((a, b) => a - b)
      if (obj.type === 'desc') {
        rows.reverse()
      }
      this.rows = rows
    }
  }
}

</script>

<style lang="scss">
</style>
