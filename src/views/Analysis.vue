<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 class="md-title">Analysis</h2>

      <Paginator :source="rows" :page-size="pageSize">
          <template scope="page">
            <datatable
                :source="page.data"
                :editable="false"
                :line-numbers="true"
                :filterable="false"
                class="analysis-table"
                >
                <datatable-column
                    v-for="column in columns"
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
        <md-button class="md-icon-button fullscreen-button" @click.native="getData()">
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
import { titleCase, retry } from 'helper-js'
import { format } from 'date-functions'

export default {
  components: { Datatable, DatatableColumn, Paginator },
  data() {
    return {
      columns: [
        { name: 'aaw' },
        { name: 'aaw_score' },
        { name: 'abw' },
        { name: 'abw_score' },
        { name: 'atw' },
        { name: 'atw_score' },
        { name: 'avg_warn_id' },
        {
          name: 'create_ts',
          formatter: (val) => format(new Date(val), 'MM-dd HH:mm')
        },
        { name: 'create_user' },
        { name: 'drv_distance' },
        { name: 'drv_duration' },
        { name: 'end_date' },
        { name: 'fcw' },
        { name: 'fcw_score' },
        { name: 'fuel_usage' },
        { name: 'hmw_h' },
        { name: 'hmw_h_score' },
        { name: 'hmw_l' },
        { name: 'hmw_l_score' },
        { name: 'hmw_m' },
        { name: 'hmw_m_score' },
        { name: 'idle_duration_non_trf' },
        { name: 'idle_duration_trf' },
        { name: 'lldw' },
        { name: 'lldw_score' },
        { name: 'pcw' },
        { name: 'pcw_score' },
        { name: 'rldw' },
        { name: 'rldw_score' },
        { name: 'spw' },
        { name: 'spw_score' },
        {
          name: 'start_date',
          formatter: (val) => format(new Date(val), 'MM-dd HH:mm')
        },
        { name: 'total_score' },
        { name: 'type' },
        { name: 'ufcw' },
        { name: 'ufcw_score' },
        { name: 'vb' },
        { name: 'vb_score' },
        { name: 'version' },
        { name: 'vrm_id' },
      ],
      rows: [],
      pageSize: 50,
    }
  },
  created() {
    // auto generate column display name
    for (const col of this.columns) {
      if (!col.text) {
        this.$set(col, 'text', titleCase(col.name))
      }
      if (!col.width) {
        const len = col.text.length
        this.$set(col, 'width', `${len > 3 ? (100 + (len - 6) * 5) : '60'}px`)
      }
    }
    //
    this.getData()
  },
  methods: {
    getData() {
      retry(() => this.$http.get('dao/avg_warning_vrm'))()
      .then(({data}) => {
        this.rows = data.JSON
      }).catch((e) => {
        window.alert('load failed')
        throw e
      })
    }
  }
}
</script>
<style lang="scss">
.analysis-table{
  &.table-wrapper{
    border: none;
  }
}
</style>
