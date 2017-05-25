<template>
  <div class="report2 m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('driverScoreAndAlertCountPer100KM')}}</h2>

        <div class="relative overflow-hidden-y">
          <md-table @select="" @sort="onSort($event, rows1, columns1)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns1" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows1" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="(col, index) in columns1" v-if="col.visible" :key="col.name" :class="index === 1 && 'rank' + row.scoreRank">
                 {{ row[col.name] }}
               </md-table-cell>
             </md-table-row>
           </md-table-body>
         </md-table>

          <div class="absolute-backdrop center-wrapper" v-show="loading1">
            <md-spinner md-indeterminate></md-spinner>
          </div>
        </div>

        <div class="card-buttons">
          <md-button class="md-icon-button" @click.native="exportExcel(rows1, columns1, $t('driverScoreAndAlertCountPer100KM'))">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData1()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>

    <md-layout md-gutter="16" class="m-t">
      <md-layout md-flex>
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">{{$t('chart1')}}</h2>

            <div class="relative">
              <div :id="chart1ID" class="w-100 chart1"></div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="chart1 && chart1.update(null)"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>

      <md-layout md-flex class="">
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">{{$t('chart2')}}</h2>

            <div class="relative">
              <div :id="chart2ID" class="w-100 chart2" ref="chart2"></div>
              <div class="chart2-blocks">
                <div class="item" v-for="(col, i) in countColumns1">
                  {{col.text}}: <div :class="['color-block', 'ct-color-'+(countColumns1.length-i)]"></div>
                </div>
              </div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="chart2 && chart2.update(null)"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>
    </md-layout>

    <md-card  class="card-1 m-t">
      <md-card-content>
        <h2 class="md-title">{{$t('driverScoreAndAlertCount')}}</h2>

        <div class="relative overflow-hidden-y">
          <md-table @select="" @sort="onSort($event, rows2, columns2)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns2" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows2" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="(col, index) in columns2" v-if="col.visible" :key="col.name">
                 {{ row[col.name] }}
               </md-table-cell>
             </md-table-row>
           </md-table-body>
         </md-table>

          <div class="absolute-backdrop center-wrapper" v-show="loading2">
            <md-spinner md-indeterminate></md-spinner>
          </div>
        </div>

        <div class="card-buttons">
          <md-button class="md-icon-button" @click.native="exportExcel(rows2, columns2, $t('driverScoreAndAlertCount'))">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData2()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>

  </div>
</template>
<script>
import { retry, windowLoaded } from 'helper-js'
import { initColumns, initRows, sortRows, generateExcel } from '../utils.js'
import { format } from 'date-functions'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

const dateFormat = 'yyyy-MM-dd'

export default {
  components: {},
  data() {
    return {
      loading1: false,
      loading2: false,
      columns1: [
        {
          name: 'start_date',
          text: this.$t('startDate'),
          valueProcessor: ({value}) => format(new Date(value), dateFormat),
        },
        {
          name: 'total_score',
          text: this.$t('totalScore')
        },
        {
          name: 'drv_distance',
          text: this.$t('drvDistance')
        },
        {
          name: 'hmw',
          text: this.$t('hmw')
        },
        {
          name: 'pcw',
          text: this.$t('pcw')
        },
        {
          name: 'fcw',
          text: this.$t('fcw')
        },
        {
          name: 'ufcw',
          text: this.$t('ufcw')
        },
        {
          name: 'lldw',
          text: this.$t('lldw')
        },
        {
          name: 'rldw',
          text: this.$t('rldw')
        },
        {
          name: 'aaw',
          text: this.$t('aaw')
        },
        {
          name: 'abw',
          text: this.$t('abw')
        }
      ],
      originRows1: [],
      rows1: [],
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      columns2: [
        {
          name: 'start_date',
          text: this.$t('startDate'),
          valueProcessor: ({value}) => format(new Date(value), dateFormat),
        },
        {
          name: 'total_score',
          text: this.$t('totalScore')
        },
        {
          name: 'drv_distance',
          text: this.$t('drvDistance')
        },
        {
          name: 'hmw',
          text: this.$t('hmw')
        },
        {
          name: 'pcw',
          text: this.$t('pcw')
        },
        {
          name: 'fcw',
          text: this.$t('fcw')
        },
        {
          name: 'ufcw',
          text: this.$t('ufcw')
        },
        {
          name: 'lldw',
          text: this.$t('lldw')
        },
        {
          name: 'rldw',
          text: this.$t('rldw')
        },
        {
          name: 'aaw',
          text: this.$t('aaw')
        },
        {
          name: 'abw',
          text: this.$t('abw')
        }
      ],
      originRows2: [],
      rows2: [],
    }
  },
  computed: {
    countColumns1() { return this.columns1.slice(3) },
    dateRange() { return this.$store.state.dateRangeInReport2 }
  },
  watch: {
    '$store.state.report2DriverId'() { this.getRows1(); this.getRows2() },
    originRows1() { this.getRows1() },
    originRows2() { this.getRows2() },
    dateRange: {
      deep: true,
      handler() { this.getRows1(); this.getRows2() },
    },
  },
  created() {
    //
    initColumns(this, this.columns1)
    initColumns(this, this.columns2)
    this.getDrivers()
    this.getData1()
    this.getData2()
  },
  methods: {
    getDrivers() {
      retry(() => this.$http.get('dao/driver'))()
      .then(({data}) => {
        const drivers = data.JSON.filter(item => item.company_id === this.$store.state.user.company_id)
        this.$store.commit('report2Drivers', drivers)
        this.$store.commit('report2DriverId', drivers[0].driver_id)
      }).catch(e => {
        this.$alert(this.$t('loadFailed'))
      })
    },
    getData1() {
      this.loading1 = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading1 = false
        this.originRows1 = data.JSON
      }).catch((e) => {
        this.originRows1 = []
        this.loading1 = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    getRows1() {
      const dateRange = this.dateRange
      const start = new Date(`${dateRange[0]} 00:00:00`).getTime()
      const end = new Date(`${dateRange[1]} 23:59:59`).getTime()
      this.rows1 = this.originRows1
      .filter(row => start <= row.start_date && row.start_date <= end) // filter by date
      .filter(row => row.company_id === this.$store.state.user.company_id && row.driver_id === this.$store.state.report2DriverId)
      // foramt count columns
      this.rows1.forEach(row => {
        this.columns1.slice(3).forEach(col => {
          row[col.name] = Math.round(((row[col.name] || 0) / (row.drv_distance / 100)) * 100000)
        })
      })
      initRows(this, this.rows1, this.columns1)
      const rows1Sorted = this.rows1.slice(0).sort((a, b) => a.total_score - b.total_score)
      rows1Sorted.reverse()
      let prev = -1
      let rank = 0
      rows1Sorted.forEach(row => {
        const cell = parseFloat(row.total_score)
        if (cell !== prev) {
          rank++
        }
        this.$set(row, 'scoreRank', rank > 20 ? 20 : rank)
        prev = cell
      })
      windowLoaded().then(() => this.renderChart1())
    },
    getData2() {
      this.loading2 = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading2 = false
        this.originRows1 = data.JSON
      }).catch((e) => {
        this.originRows2 = []
        this.loading1 = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    getRows2() {
      const dateRange = this.dateRange
      const start = new Date(`${dateRange[0]} 00:00:00`).getTime()
      const end = new Date(`${dateRange[1]} 23:59:59`).getTime()
      this.rows2 = this.originRows2
      .filter(row => start <= row.start_date && row.start_date <= end) // filter by date
      .filter(row => row.company_id === this.$store.state.user.company_id && row.driver_id === this.$store.state.report2DriverId)
      initRows(this, this.rows2, this.columns2)
      windowLoaded().then(() => this.renderChart2())
    },
    onSort(e, rows, columns) {
      sortRows(e, rows, columns)
    },
    exportExcel(rows, columns, title) {
      const cols = columns
      const data = rows.map(row => {
        const r = []
        cols.forEach(col => {
          const val = row[col.name]
          r.push(col.formatter ? col.formatter(val) : val)
        })
        return r
      })
      const titleLabels = cols.map(col => col.text)
      generateExcel(data, title, titleLabels)
    },
    renderChart1() {
      var ctx = document.getElementById(this.chart1ID)
      if (this.chart1) {
        this.chart1.detach()
        ctx.innerHTML = ''
      }
      this.chart1 = new Chartist.Bar(ctx, {
        labels: this.rows1.map(row => row.start_date.replace(/^\d{4}-/, '')),
        series: [
          this.rows1.map(row => row.total_score),
        ]
      },
        {
          seriesBarDistance: 10,
          reverseData: true,
          horizontalBars: false,
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
      const labelCols = this.countColumns1
      this.chart2 = new Chartist.Line(ctx, {
        labels: this.rows1.map(row => row.start_date.replace(/^\d{4}-/, '')),
        series: labelCols.map(col => this.rows1.map(row => row[col.name])),
      }, {
        fullWidth: true,
        chartPadding: {
          right: 30
        }
      })
    },
  }
}
</script>
<style lang="scss">
.report2{
  .md-table-cell, .md-table tbody .md-table-row:hover .md-table-cell{
    $total : 20;
    $half : $total / 2;
    $unit : 255 / $half;
    @for $i from 1 through $total{
      &.rank#{$i}{
        @if $i <= $half {
          $red : ($i - 1) * $unit;
          $green: 255;
          background-color: rgb($red, $green, 30);
        }
        @else {
          $red : 255;
          $green: 255 - ($i - 10) * $unit;
          background-color: rgb($red, $green, 30);
        }
      }
    }
  }
  .chart1{
    line.ct-bar{
      stroke: #2196f3;
    }
  }
  .chart2-blocks{
    padding: 0 5px;
    .item{
      display: inline-block;
      margin-right: .5em;
      .color-block{
        display: inline-block;
        width: 30px;
        height: 10px;
        vertical-align: middle;
      }
    }
  }
}
</style>
