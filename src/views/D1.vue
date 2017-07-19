<template>
  <div class="m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">D1
          <small style="color:grey;"><i>{{dateRangeText}}</i></small>
        </h2>

        <div class="relative overflow-hidden-y">

          <md-table @select="" @sort="onSort">
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
          <md-select v-model="groupBy" class="m-r">
            <md-option value="vrm_grp_id">{{$t('group')}}</md-option>
            <md-option value="vrm_mark_code">{{$t('vehicle')}}</md-option>
         </md-select>
          <md-select v-model="dateRange">
            <md-option :value="1">{{$t('lastDate')}}</md-option>
            <md-option :value="2">{{$t('lastWeek')}}</md-option>
            <md-option :value="3">{{$t('lastMonth')}}</md-option>
         </md-select>
          <md-button class="md-icon-button" @click.native="exportExcel">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>

    <md-layout md-gutter class="m-t">
      <md-layout md-flex>
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">{{$t('totalScore')}}</h2>

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
            <h2 class="md-title">{{$t('alertDetails')}}</h2>

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
import { format, subDays, subMonth, getMonthStart } from 'date-functions'
import { initColumns, initRows, sortRows, generateExcel, newDate } from '../utils.js'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

const chart2Fields = ['pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']

export default {
  data() {
    return {
      title: this.$t('analysis'),
      columns: [
        { name: 'vrm_grp_id', text: this.$t('group') },
        { name: 'total_score',
          text: this.$t('totalScore')
        },
        { name: 'pcw',
          text: this.$t('pcw'),
        },
        { name: 'hmw_h',
          text: this.$t('hmwH'),
        },
        { name: 'hmw_m',
          text: this.$t('hmwM'),
        },
        { name: 'hmw_l',
          text: this.$t('hmwL'),
        },
        { name: 'fcw',
          text: this.$t('fcw'),
        },
        { name: 'ufcw_h',
          text: this.$t('ufcwH'),
        },
        { name: 'ufcw_l',
          text: this.$t('ufcwL'),
        },
        { name: 'lldw',
          text: this.$t('lldw'),
        },
        { name: 'rldw',
          text: this.$t('rldw'),
        },
        { name: 'spw',
          text: this.$t('spw'),
        },
        { name: 'aaw',
          text: this.$t('aaw'),
        },
        { name: 'abw',
          text: this.$t('abw'),
        },
        { name: 'atw',
          text: this.$t('atw'),
        },
        { name: 'vb',
          text: this.$t('vb')
        },
        { name: 'drv_distance',
          text: this.$t('drvDistance'),
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
      dateRangeText: null,
      groupBy: 'vrm_grp_id', // group, vehicle
    }
  },
  computed: {
    api() { return this.groupBy === 'vrm_grp_id' ? 'dao/avg_warning_vrm_grp_co' : 'dao/v_avg_warning_vrm_co' },
  },
  created() {
    //
    initColumns(this, this.columns)
    this.getData()
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
      // declare chart2 event
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
    groupBy() {
      if (this.groupBy === 'vrm_grp_id') {
        Object.assign(this.columns[0], { name: 'vrm_grp_id', text: this.$t('group') })
      } else {
        Object.assign(this.columns[0], { name: 'vrm_mark_code', text: this.$t('vehicle') })
      }
      this.getData()
    },
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
      retry(() => this.$http.get(this.api))()
      .then(({data}) => {
        this.loading = false
        this.originRows = data.JSON.filter(row => row.company_id === this.$store.state.user.company_id)
      }).catch((e) => {
        this.loading = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    onSort(e) {
      sortRows(e, this.rows, this.columns)
    },
    resolveRows() {
      // filter by time
      const now = new Date()
      let startDate = null
      let dateType = null
      switch (this.dateRange) {
        case 1:
          dateType = 'D'
          this.dateRangeText = format(subDays(now, 1), 'yyyy-MM-dd')
          break
        case 2:
          dateType = 'W'
          this.dateRangeText = format(subDays(now, now.getDay() - 1 + 7), 'yyyy-MM-dd')
          break
        case 3:
          dateType = 'M'
          this.dateRangeText = format(getMonthStart(subMonth(now)), 'yyyy-MM-dd')
          break
      }
      startDate = newDate(`${this.dateRangeText} 00:00:00`).getTime()
      const filteredRows = this.originRows.filter(row => row.type === dateType && row.start_date === startDate)
      // aggregrate by vrm_grp_id
      const groupedRows = []
      const toAggregrate = ['total_score', 'drv_distance', 'pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw', 'ucfw_h', 'ucfw_l', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']
      const groupBy = this.groupBy
      filteredRows.forEach(row => {
        let row0 = groupedRows.find(v => v[groupBy] === row[groupBy])
        if (!row0) {
          row0 = Object.assign({ _count: 0 }, row)
          groupedRows.push(row0)
        } else {
          toAggregrate.forEach(field => {
            row0[field] = (row0[field] || 0) + (row[field] || 0)
          })
        }
        row0._count++
      })
      // average total_score, drv_distance
      groupedRows.forEach(row => {
        row.total_score = Math.round(row.total_score / row._count)
        row.drv_distance = Math.round(row.drv_distance / 100000)
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
      const groupBy = this.groupBy
      this.chart1 = new Chartist.Bar(ctx, {
        labels: this.rows.map(row => row[groupBy]),
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
      const groupBy = this.groupBy
      this.chart2 = new Chartist.Bar(ctx, {
        labels: this.rows.map(row => row[groupBy]),
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
