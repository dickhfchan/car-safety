<template>
  <div class="m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">D1</h2>

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

    <md-layout md-gutter class="m-t">
      <md-layout md-flex>
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">Total Score</h2>

            <div class="relative">
              <div :id="chart1ID" class="w-100 d1-chart1"></div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="chart1 && chart1.update(null)"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>

      <md-layout md-flex class="m-l">
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">Alert Details</h2>

            <div class="relative">
              <div :id="chart2ID" class="w-100 d1-chart2" style="height:400px;" ref="chart2"></div>
              <div class="bouble" ref="chart2Bouble" :style="chart2BoubleStyle" @mouseenter="enterChart2Bouble()" @mouseleave="leaveChart2Bouble()"></div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="chart2 && chart2.update(null)"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>
    </md-layout>
  </div>
</template>
<script>
import { Datatable, DatatableColumn } from '@/components/datatable'
import Paginator from '../../node_modules/vuetiful/src/components/paginator/paginator.vue'
import { retry } from 'helper-js'
import { subDays } from 'date-functions'
import { initColumns, generateExcel } from '../utils.js'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

const chart2Fields = ['pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']

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
        { name: 'vb' },
        { name: 'drv_distance',
          text: 'Distance Travelled',
        },
      ],
      rows: [],
      pageSize: 20,
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      chart2BoubleStyle: null,
    }
  },
  created() {
    //
    initColumns(this, this.columns)
    this.getData()
  },
  mounted() {
    this.$nextTick(() => {
      window._dt1Chart2MouseEnter = (e) => {
        const bouble = this.$refs.chart2Bouble
        bouble.innerHTML = `<b>${e.getAttribute('data-name')}</b> ${e.getAttribute('ct:value')}`
        this.chart2BoubleStyle = {
          top: e.getAttribute('y1') + 'px',
          left: e.getAttribute('x1') + 'px',
          display: 'inline-block',
        }
      }
      window._dt1Chart2MouseLeave = (e) => {
        this._prevChart2BoubleStyle = this.chart2BoubleStyle
        this.chart2BoubleStyle = {}
      }
    })
  },
  watch: {
    rows() {
      this.$nextTick(() => {
        this.renderChart1()
        this.renderChart2()
      })
    }
  },
  methods: {
    getData() {
      this.loading = true
      retry(() => this.$http.get('dao/avg_warning_vrm_grp'))()
      .then(({data}) => {
        this.loading = false
        // filter by time and aggregrate by vrm_grp_id
        const now = new Date()
        const lastWeek = subDays(now, 3000)
        lastWeek.setHours(0)
        lastWeek.setMinutes(0)
        lastWeek.setSeconds(0)
        const minTime = lastWeek.getTime()
        const groupedRows = []
        const toAggregrate = ['total_score', 'pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']
        data.JSON.filter(row => row.start_date >= minTime).forEach(row => {
          let row0 = groupedRows.find(v => v.vrm_grp_id === row.vrm_grp_id)
          if (!row0) {
            row0 = Object.assign({}, row)
            groupedRows.push(row0)
          }
          toAggregrate.forEach(field => {
            row0[field] = (row0[field] || 0) + (row[field] || 0)
          })
        })
        this.rows = groupedRows
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
      generateExcel(data, 'D1', titleLabels)
    },
    renderChart1() {
      var ctx = document.getElementById(this.chart1ID)
      if (this.chart1) {
        this.chart1.detach()
        ctx.innerHTML = ''
      }
      this.chart1 = new Chartist.Bar(ctx, {
        labels: this.rows.map(row => row.vrm_grp_id),
        series: [
          this.rows.map(row => row.total_score),
        ]
      },
        {
          seriesBarDistance: 10,
          reverseData: true,
          horizontalBars: true,
          axisY: {
            offset: 70
          }
        })
    },
    renderChart2() {
      var ctx = document.getElementById(this.chart2ID)
      if (this.chart2) {
        this.chart2.detach()
        ctx.innerHTML = ''
      }
      this.chart2 = new Chartist.Bar(ctx, {
        labels: this.rows.map(row => row.vrm_grp_id),
        series: chart2Fields.map(field => this.rows.map(row => row[field]))
      }, {
        // horizontalBars: true,
        stackBars: true,
      }).on('draw', (data) => {
        if (data.type === 'bar') {
          data.element.attr({
            style: 'stroke-width: 30px',
            'data-name': this.columns.find(col => col.name === chart2Fields[data.seriesIndex]).text,
            onmouseenter: 'window._dt1Chart2MouseEnter(this)',
            onmouseleave: 'window._dt1Chart2MouseLeave(this)',
          })
        }
      })
    },
    enterChart2Bouble() {
      this.chart2BoubleStyle = this._prevChart2BoubleStyle
    },
    leaveChart2Bouble() {
      this._prevChart2BoubleStyle = this.chart2BoubleStyle
      this.chart2BoubleStyle = {}
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
.d1-chart1{
  line.ct-bar{
    stroke: #2196f3;
  }
}
.bouble {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0px 0px 3px 0px #c3c3c3;
  position: absolute;
  display: none;
  background-color: #fff;
  z-index: 999;
}
</style>
