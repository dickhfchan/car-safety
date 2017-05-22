<template>
  <div class="report2 m-a">
    <md-card  class="card-1">
      <md-card-content>
        <h2 class="md-title">司機安全評分及每百公里警報次數</h2>

        <div class="relative">
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
          <md-button class="md-icon-button" @click.native="exportExcel(rows1, columns1, '司機安全評分及每百公里警報次數')">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">Export</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData1()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">Refresh</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>

    <md-layout md-gutter="16" class="m-t">
      <md-layout md-flex>
        <md-card  class="card-1 flex-1">
          <md-card-content>
            <h2 class="md-title">Chart1</h2>

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
            <h2 class="md-title">Chart2</h2>

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
        <h2 class="md-title">司機安全評分及警報次數</h2>

        <div class="relative">
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
          <md-button class="md-icon-button" @click.native="exportExcel(rows2, columns2, '司機安全評分及警報次數')">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">Export</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData2()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">Refresh</md-tooltip>
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
          text: 'Date',
          valueProcessor: ({value}) => format(new Date(value), dateFormat),
        },
        {
          name: 'total_score',
          text: '安全評分'
        },
        {
          name: 'drv_distance',
          text: '公里數'
        },
        {
          name: 'hmw',
          text: '跟車太近'
        },
        {
          name: 'pcw',
          text: '行人前撞'
        },
        {
          name: 'fcw',
          text: '高速前撞'
        },
        {
          name: 'ufcw',
          text: '低速前撞'
        },
        {
          name: 'lldw',
          text: '左道偏離'
        },
        {
          name: 'rldw',
          text: '右道偏離'
        },
        {
          name: 'aaw',
          text: '急加速'
        },
        {
          name: 'abw',
          text: '急刹車'
        }
      ],
      rows1: [],
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      columns2: [
        {
          name: 'start_date',
          text: 'Date',
          valueProcessor: ({value}) => format(new Date(value), dateFormat),
        },
        {
          name: 'total_score',
          text: '安全評分'
        },
        {
          name: 'drv_distance',
          text: '公里數'
        },
        {
          name: 'hmw',
          text: '跟車太近'
        },
        {
          name: 'pcw',
          text: '行人前撞'
        },
        {
          name: 'fcw',
          text: '高速前撞'
        },
        {
          name: 'ufcw',
          text: '低速前撞'
        },
        {
          name: 'lldw',
          text: '左道偏離'
        },
        {
          name: 'rldw',
          text: '右道偏離'
        },
        {
          name: 'aaw',
          text: '急加速'
        },
        {
          name: 'abw',
          text: '急刹車'
        }
      ],
      rows2: [],
    }
  },
  computed: {
    countColumns1() { return this.columns1.slice(3) }
  },
  created() {
    //
    initColumns(this, this.columns1)
    initColumns(this, this.columns2)
    this.getData1()
    this.getData2()
  },
  methods: {
    getData1() {
      this.loading1 = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading1 = false
        this.rows1 = data.JSON
        // todo hard code company_id to 22
        .filter(row => row.company_id === 22)
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
      }).catch((e) => {
        this.loading1 = false
        this.$alert('load failed')
        throw e
      })
    },
    getData2() {
      this.loading2 = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading2 = false
        this.rows2 = data.JSON
        // todo hard code company_id to 22
        .filter(row => row.company_id === 22)
        initRows(this, this.rows2, this.columns2)
        windowLoaded().then(() => this.renderChart2())
      }).catch((e) => {
        this.loading1 = false
        this.$alert('load failed')
        throw e
      })
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
    $unit : 255 / $total;
    @for $i from 1 through $total{
      &.rank#{$i}{
        $red : ($i - 1) * $unit;
        background-color: rgb($red, 255 - $red, 30);
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
