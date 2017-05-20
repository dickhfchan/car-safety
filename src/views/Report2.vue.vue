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

          <div class="absolute-backdrop center-wrapper" v-show="loading">
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

          <div class="absolute-backdrop center-wrapper" v-show="loading">
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
import { retry } from 'helper-js'
import { initColumns, initRows, sortRows, generateExcel } from '../utils.js'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

export default {
  components: {},
  data() {
    return {
      loading: false,
      columns1: [
        {
          'name': 'Date'
        },
        {
          'name': '安全評分'
        },
        {
          'name': '公里數'
        },
        {
          'name': '跟車太近'
        },
        {
          'name': '行人前撞'
        },
        {
          'name': '高速前撞'
        },
        {
          'name': '低速前撞'
        },
        {
          'name': '左道偏離'
        },
        {
          'name': '右道偏離'
        },
        {
          'name': '急加速'
        },
        {
          'name': '急刹車'
        }
      ],
      rows1: [],
      chart1: null,
      chart1ID: `chart1_${this._uid}`,
      chart2: null,
      chart2ID: `chart2_${this._uid}`,
      columns2: [
        {
          'name': 'Date'
        },
        {
          'name': '安全評分'
        },
        {
          'name': '公里數'
        },
        {
          'name': '跟車太近'
        },
        {
          'name': '行人前撞'
        },
        {
          'name': '高速前撞'
        },
        {
          'name': '低速前撞'
        },
        {
          'name': '左道偏離'
        },
        {
          'name': '右道偏離'
        },
        {
          'name': '急加速'
        },
        {
          'name': '急刹車'
        }
      ],
      rows2: [],
    }
  },
  created() {
    //
    initColumns(this, this.columns1)
    initColumns(this, this.columns2)
    this.getData1()
    this.getData2()
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart1()
      this.renderChart2()
    })
  },
  methods: {
    getData1() {
      this.rows1 = [{'Date': '2017-5-18', '安全評分': '90', '公里數': '257', '跟車太近': '38.9', '行人前撞': '9.3', '高速前撞': '8.9', '低速前撞': '3.1', '左道偏離': '28.0', '右道偏離': '27.2', '急加速': '30.4', '急刹車': '19.5'}, {'Date': '2017-5-17', '安全評分': '74', '公里數': '271', '跟車太近': '10.3', '行人前撞': '0.7', '高速前撞': '26.9', '低速前撞': '13.3', '左道偏離': '36.5', '右道偏離': '36.2', '急加速': '10.0', '急刹車': '14.4'}, {'Date': '2017-5-16', '安全評分': '37', '公里數': '133', '跟車太近': '6.0', '行人前撞': '34.6', '高速前撞': '62.4', '低速前撞': '45.9', '左道偏離': '36.1', '右道偏離': '0.8', '急加速': '54.1', '急刹車': '61.7'}, {'Date': '2017-5-15', '安全評分': '57', '公里數': '233', '跟車太近': '18.9', '行人前撞': '39.1', '高速前撞': '40.8', '低速前撞': '42.1', '左道偏離': '15.0', '右道偏離': '34.3', '急加速': '41.2', '急刹車': '19.7'}, {'Date': '2017-5-14', '安全評分': '57', '公里數': '263', '跟車太近': '30.4', '行人前撞': '6.8', '高速前撞': '5.7', '低速前撞': '19.0', '左道偏離': '11.0', '右道偏離': '30.8', '急加速': '13.3', '急刹車': '1.5'}, {'Date': '2017-5-13', '安全評分': '45', '公里數': '240', '跟車太近': '34.2', '行人前撞': '5.0', '高速前撞': '24.2', '低速前撞': '38.3', '左道偏離': '39.2', '右道偏離': '12.5', '急加速': '35.0', '急刹車': '39.2'}, {'Date': '2017-5-12', '安全評分': '28', '公里數': '138', '跟車太近': '23.9', '行人前撞': '26.1', '高速前撞': '31.2', '低速前撞': '38.4', '左道偏離': '39.9', '右道偏離': '26.8', '急加速': '27.5', '急刹車': '58.0'}, {'Date': '2017-5-11', '安全評分': '77', '公里數': '196', '跟車太近': '45.4', '行人前撞': '43.9', '高速前撞': '5.1', '低速前撞': '8.2', '左道偏離': '4.6', '右道偏離': '18.4', '急加速': '32.1', '急刹車': '11.2'}, {'Date': '2017-5-10', '安全評分': '81', '公里數': '267', '跟車太近': '19.5', '行人前撞': '34.5', '高速前撞': '24.3', '低速前撞': '34.8', '左道偏離': '19.1', '右道偏離': '28.8', '急加速': '4.5', '急刹車': '1.9'}, {'Date': '2017-5-9', '安全評分': '40', '公里數': '69', '跟車太近': '65.2', '行人前撞': '111.6', '高速前撞': '44.9', '低速前撞': '97.1', '左道偏離': '15.9', '右道偏離': '53.6', '急加速': '26.1', '急刹車': '33.3'}, {'Date': '2017-5-8', '安全評分': '54', '公里數': '271', '跟車太近': '0.7', '行人前撞': '2.2', '高速前撞': '28.0', '低速前撞': '8.9', '左道偏離': '22.1', '右道偏離': '14.4', '急加速': '16.6', '急刹車': '6.6'}, {'Date': '2017-5-7', '安全評分': '17', '公里數': '202', '跟車太近': '34.7', '行人前撞': '40.6', '高速前撞': '10.4', '低速前撞': '6.4', '左道偏離': '35.1', '右道偏離': '48.5', '急加速': '48.0', '急刹車': '6.4'}, {'Date': '2017-5-6', '安全評分': '72', '公里數': '79', '跟車太近': '44.3', '行人前撞': '87.3', '高速前撞': '98.7', '低速前撞': '40.5', '左道偏離': '124.1', '右道偏離': '91.1', '急加速': '98.7', '急刹車': '108.9'}, {'Date': '2017-5-5', '安全評分': '11', '公里數': '233', '跟車太近': '26.6', '行人前撞': '28.3', '高速前撞': '27.5', '低速前撞': '4.3', '左道偏離': '33.9', '右道偏離': '15.0', '急加速': '29.2', '急刹車': '36.5'}]
      initRows(this, this.rows1, this.columns1)
      const rows1Sorted = this.rows1.slice(0).sort((a, b) => a['安全評分'] - b['安全評分'])
      rows1Sorted.reverse()
      let prev = -1
      let rank = 0
      rows1Sorted.forEach(row => {
        const cell = parseFloat(row['安全評分'])
        if (cell !== prev) {
          rank++
        }
        this.$set(row, 'scoreRank', rank)
        prev = cell
      })
    },
    getData2() {
      this.rows2 = [{'Date': '2017-5-18', '安全評分': '61', '公里數': '257', '跟車太近': '100', '行人前撞': '24', '高速前撞': '23', '低速前撞': '8', '左道偏離': '72', '右道偏離': '70', '急加速': '78', '急刹車': '50'}, {'Date': '2017-5-17', '安全評分': '22', '公里數': '271', '跟車太近': '28', '行人前撞': '2', '高速前撞': '73', '低速前撞': '36', '左道偏離': '99', '右道偏離': '98', '急加速': '27', '急刹車': '39'}, {'Date': '2017-5-16', '安全評分': '74', '公里數': '133', '跟車太近': '8', '行人前撞': '46', '高速前撞': '83', '低速前撞': '61', '左道偏離': '48', '右道偏離': '1', '急加速': '72', '急刹車': '82'}, {'Date': '2017-5-15', '安全評分': '48', '公里數': '233', '跟車太近': '44', '行人前撞': '91', '高速前撞': '95', '低速前撞': '98', '左道偏離': '35', '右道偏離': '80', '急加速': '96', '急刹車': '46'}, {'Date': '2017-5-14', '安全評分': '35', '公里數': '263', '跟車太近': '80', '行人前撞': '18', '高速前撞': '15', '低速前撞': '50', '左道偏離': '29', '右道偏離': '81', '急加速': '35', '急刹車': '4'}, {'Date': '2017-5-13', '安全評分': '21', '公里數': '240', '跟車太近': '82', '行人前撞': '12', '高速前撞': '58', '低速前撞': '92', '左道偏離': '94', '右道偏離': '30', '急加速': '84', '急刹車': '94'}, {'Date': '2017-5-12', '安全評分': '3', '公里數': '138', '跟車太近': '33', '行人前撞': '36', '高速前撞': '43', '低速前撞': '53', '左道偏離': '55', '右道偏離': '37', '急加速': '38', '急刹車': '80'}, {'Date': '2017-5-11', '安全評分': '30', '公里數': '196', '跟車太近': '89', '行人前撞': '86', '高速前撞': '10', '低速前撞': '16', '左道偏離': '9', '右道偏離': '36', '急加速': '63', '急刹車': '22'}, {'Date': '2017-5-10', '安全評分': '11', '公里數': '267', '跟車太近': '52', '行人前撞': '92', '高速前撞': '65', '低速前撞': '93', '左道偏離': '51', '右道偏離': '77', '急加速': '12', '急刹車': '5'}, {'Date': '2017-5-9', '安全評分': '57', '公里數': '69', '跟車太近': '45', '行人前撞': '77', '高速前撞': '31', '低速前撞': '67', '左道偏離': '11', '右道偏離': '37', '急加速': '18', '急刹車': '23'}, {'Date': '2017-5-8', '安全評分': '3', '公里數': '271', '跟車太近': '2', '行人前撞': '6', '高速前撞': '76', '低速前撞': '24', '左道偏離': '60', '右道偏離': '39', '急加速': '45', '急刹車': '18'}, {'Date': '2017-5-7', '安全評分': '51', '公里數': '202', '跟車太近': '70', '行人前撞': '82', '高速前撞': '21', '低速前撞': '13', '左道偏離': '71', '右道偏離': '98', '急加速': '97', '急刹車': '13'}, {'Date': '2017-5-6', '安全評分': '23', '公里數': '79', '跟車太近': '35', '行人前撞': '69', '高速前撞': '78', '低速前撞': '32', '左道偏離': '98', '右道偏離': '72', '急加速': '78', '急刹車': '86'}, {'Date': '2017-5-5', '安全評分': '62', '公里數': '233', '跟車太近': '62', '行人前撞': '66', '高速前撞': '64', '低速前撞': '10', '左道偏離': '79', '右道偏離': '35', '急加速': '68', '急刹車': '85'}]
      initRows(this, this.rows2, this.columns2)
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
        labels: this.rows1.map(row => row['Date']),
        series: [
          this.rows1.map(row => row['安全評分']),
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
      this.chart2 = new Chartist.Line(ctx, {
        labels: this.columns1.slice(2).map(col => col.name),
        series: this.rows1.map(row => Object.values(row).slice(2)),
      }, {
        fullWidth: true,
        chartPadding: {
          right: 0
        }
      })
    },
  }
}
</script>
<style lang="scss">
.report2{
  .md-table-cell, .md-table tbody .md-table-row:hover .md-table-cell{
    $total : 15;
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
}
</style>
