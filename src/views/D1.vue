<template>
  <div class="m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">D1
          <small style="color:grey;"><i>{{dateRangeText}}</i></small>
        </h2>

        <div class="relative">

          <md-table :md-sort="'vrm_grp_id'" md-sort-type="asc" @select="" @sort="onSort">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="col in columns" v-if="col.visible" :key="col.name">
                 {{ row[col.name] }}
               </md-table-cell>
             </md-table-row>
           </md-table-body>
         </md-table>

          <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div>
        </div>

        <div class="card-buttons">
          <md-select v-model="dateRange">
            <md-option :value="1">Last Date</md-option>
            <md-option :value="2">Last Week</md-option>
            <md-option :value="3">Last Month</md-option>
         </md-select>
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
import { retry } from 'helper-js'
import { format, subDays, subMonth, getMonthStart, getMonthEnd } from 'date-functions'
import { initColumns, initRows, sortRows, generateExcel } from '../utils.js'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

const chart2Fields = ['pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']

export default {
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
      originRows: [],
      rows: [],
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      chart2BoubleStyle: null,
      dateRange: 1,
      dateRangeText: null
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
    originRows() { this.resolveRows() },
    dateRange() { this.resolveRows() },
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
        this.originRows = data.JSON
      }).catch((e) => {
        this.loading = false
        this.$alert('load failed')
        throw e
      })
    },
    onSort(e) {
      sortRows(e, this.rows, this.columns)
    },
    resolveRows() {
      // filter by time
      // todo replace to really date
      // const getNow = () => new Date()
      const getNow = () => new Date('2017-04-27 00:00:00')
      let start = null
      let end = null
      switch (this.dateRange) {
        case 1:
          start = subDays(getNow(), 1)
          end = subDays(getNow(), 1)
          this.dateRangeText = format(start, 'yyyy-MM-dd')
          break
        case 2:
          const t1 = getNow()
          const t2 = getNow()
          start = subDays(t1, t1.getDay() - 1 + 7)
          end = subDays(t2, t2.getDay())
          this.dateRangeText = `${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`
          break
        case 3:
          start = getMonthStart(subMonth(getNow()))
          end = getMonthEnd(subMonth(getNow()))
          this.dateRangeText = `${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`
          break
      }
      start.setHours(0)
      start.setMinutes(0)
      start.setSeconds(0)
      start.setMilliseconds(0)
      end.setHours(23)
      end.setMinutes(59)
      end.setSeconds(59)
      end.setMilliseconds(999)
      start = start.getTime()
      end = end.getTime()
      const filteredRows = this.originRows.filter(row => row.start_date >= start && row.start_date <= end)
      // aggregrate by vrm_grp_id
      const groupedRows = []
      const toAggregrate = ['total_score', 'drv_distance', 'pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']
      filteredRows.forEach(row => {
        let row0 = groupedRows.find(v => v.vrm_grp_id === row.vrm_grp_id)
        if (!row0) {
          row0 = Object.assign({ _count: 0 }, row)
          groupedRows.push(row0)
        }
        row0._count++
        toAggregrate.forEach(field => {
          row0[field] = (row0[field] || 0) + (row[field] || 0)
        })
      })
      // average total_score, drv_distance
      groupedRows.forEach(row => {
        row.total_score = row.total_score / row._count
        row.drv_distance = row.drv_distance / 100000
      })
      this.rows = groupedRows
      initRows(this, this.rows, this.columns)
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
