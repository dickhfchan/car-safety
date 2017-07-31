<template>
  <div class="report2 m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('driverScoreAndAlertCountPer100KM')}}</h2>

        <div class="relative overflow-hidden-y">
          <Report2-Data-Table :report2="self" :rows="rows1" :columns="columns1" sortBy="start_date_formatted" sortType="desc"></Report2-Data-Table>

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
            <h2 class="md-title">{{$t('driverScore')}}</h2>

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
            <h2 class="md-title">{{$t('warningCountHistoryPer100KM')}}</h2>

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
          <Data-Table :rows="rows2" :columns="columns2" sortBy="start_date_formatted" sortType="desc"></Data-Table>

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
import { generateExcel, newDate, getRankColor, getRanks } from '../utils.js'
import { format } from 'date-functions'
import Chartist from 'chartist'
import DataTable from '../components/DataTable.vue'
import Report2DataTable from '../components/Report2DataTable.vue'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

const dateFormat = 'yyyy-MM-dd'

export default {
  components: { DataTable, Report2DataTable },
  data() {
    return {
      self: this,
      title: this.$t('driverScoreAndAlert'),
      loading1: false,
      loading2: false,
      columns1: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), dateFormat),
          sortBy: 'start_date',
        },
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
      originRows1: [],
      rows1: [],
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      columns2: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), dateFormat),
          sortBy: 'start_date',
        },
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
      originRows2: [],
      rows2: [],
    }
  },
  computed: {
    countColumns1() { return this.columns1.slice(2).filter(col => col.name !== 'drv_distance') },
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
    this.getDrivers()
    this.getData1()
    this.getData2()
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    getDrivers() {
      retry(() => this.$http.get('dao/driver'), 1)()
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
      retry(() => this.$http.get('dao/avg_warning_drv_name'), 1)()
      .then(({data}) => {
        this.loading1 = false
        this.originRows1 = data.JSON.sort((a, b) => a.start_date - b.start_date)
      }).catch((e) => {
        this.originRows1 = []
        this.loading1 = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    getRows1() {
      const dateRange = this.dateRange
      const start = newDate(`${dateRange[0]} 00:00:00`).getTime()
      const end = newDate(`${dateRange[1]} 23:59:59`).getTime()
      this.rows1 = this.originRows1
      .filter(row => start <= row.start_date && row.start_date <= end) // filter by date
      .filter(row => row.company_id === this.$store.state.user.company_id && row.driver_id === this.$store.state.report2DriverId)
      .map(row => Object.assign({}, row)) // clone row
      // format count columns
      this.rows1.forEach(row => {
        this.columns1.slice(2).filter(col => col.name !== 'drv_distance').forEach(col => {
          row[col.name] = Math.round(((row[col.name] || 0) / (row.drv_distance / 100)) * 100000)
        })
        row.drv_distance = Math.round(row.drv_distance / 100000)
      })
      // set scoreRank column
      const oneCol = this.rows1.map(row => row['total_score'])
      const ranks = getRanks(oneCol, 'desc')
      this.rows1.forEach((row, i) => {
        this.$set(row, 'scoreRank', ranks[i])
      })
      // render chart1
      windowLoaded().then(() => this.renderChart1())
    },
    getData2() {
      this.loading2 = true
      this.$http.get('dao/avg_warning_drv_name')
      .then(({data}) => {
        this.loading2 = false
        this.originRows2 = data.JSON
      }).catch((e) => {
        this.originRows2 = []
        this.loading1 = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    getRows2() {
      const dateRange = this.dateRange
      const start = newDate(`${dateRange[0]} 00:00:00`).getTime()
      const end = newDate(`${dateRange[1]} 23:59:59`).getTime()
      this.rows2 = this.originRows2
      .filter(row => start <= row.start_date && row.start_date <= end) // filter by date
      .filter(row => row.company_id === this.$store.state.user.company_id && row.driver_id === this.$store.state.report2DriverId)
      .map(row => Object.assign({}, row)) // clone row
      this.rows2.forEach(row => {
        row.drv_distance = Math.round(row.drv_distance / 100000)
      })
      windowLoaded().then(() => this.renderChart2())
    },
    getRankColor,
    getColorStyle(rows, row, col, order = 'asc') {
      if (col.name === 'total_score') {
        const max = Math.max(...rows.map(row => row['scoreRank']))
        const color = this.getRankColor(row['scoreRank'], max, order)
        return { backgroundColor: color }
      }
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
      try {
        this.chart1.detach()
        ctx.innerHTML = ''
      } catch (e) {}
      this.chart1 = new Chartist.Bar(ctx, {
        labels: this.rows1.map(row => row.start_date_formatted.replace(/^\d{4}-/, '')),
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
      try {
        this.chart2.detach()
        ctx.innerHTML = ''
      } catch (e) {}
      const labelCols = this.countColumns1
      this.chart2 = new Chartist.Line(ctx, {
        labels: this.rows1.map(row => row.start_date_formatted.replace(/^\d{4}-/, '')),
        series: labelCols.map(col => this.rows1.map(row => row[col.name])),
      }, {
        reverseData: true,
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
