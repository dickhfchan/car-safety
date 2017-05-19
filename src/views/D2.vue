<template>
  <div class="">
    <md-card  class="m-a card-1">
      <md-card-content>
        <h2 class="md-title">安全評分及每百公里警報次數</h2>

        <div class="relative">
          <md-table @select="" @sort="onSort($event, rows1, columns1)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns1" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows1" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="col in columns1" v-if="col.visible" :key="col.name">
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
          <md-button class="md-icon-button" @click.native="exportExcel(rows1, columns1, '安全評分及每百公里警報次數')">
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

    <md-card  class="m-x m-b card-1">
      <md-card-content>
        <h2 class="md-title">排名圖</h2>

        <div class="relative">
          <md-table @select="" @sort="onSort($event, rows1Ranking, columns1)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns1" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows1Ranking" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="(col, index) in columns1" v-if="col.visible" :key="col.name" :class="index > 1 && 'rank' + row[col.name]">
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
          <md-button class="md-icon-button" @click.native="exportExcel(rows1Ranking, columns1, '排名圖')">
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
  </div>
</template>
<script>
import { retry } from 'helper-js'
import { initColumns, initRows, sortRows, generateExcel } from '../utils.js'

export default {
  components: {},
  data() {
    return {
      columns1: [
        {
          'name': '司機'
        },
        {
          'name': '車牌'
        },
        {
          'name': '安全評分'
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
      rows1Ranking: [],
      loading: false,
    }
  },
  created() {
    //
    initColumns(this, this.columns1)
    this.getData()
  },
  methods: {
    getData() {
      this.rows1 = [{'司機': 'A 冯月新', '車牌': 'B03015D', '安全評分': '68.8', '跟車太近': '136.4', '行人前撞': '1.9', '高速前撞': '0.6', '低速前撞': '9.6', '左道偏離': '5.1', '右道偏離': '8.9', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'A 陈朝新', '車牌': 'B03015D', '安全評分': '63.6', '跟車太近': '87.6', '行人前撞': '0.4', '高速前撞': '0.0', '低速前撞': '23.6', '左道偏離': '5.7', '右道偏離': '10.5', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'E 刘东峰', '車牌': 'B01339D', '安全評分': '62.5', '跟車太近': '105.3', '行人前撞': '0.9', '高速前撞': '0.0', '低速前撞': '25.5', '左道偏離': '6.1', '右道偏離': '9.7', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'D 董明波', '車牌': 'B01339D', '安全評分': '62.5', '跟車太近': '122.2', '行人前撞': '0.9', '高速前撞': '0.0', '低速前撞': '28.1', '左道偏離': '4.8', '右道偏離': '11.0', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'H 刘卫平', '車牌': 'B03049D', '安全評分': '61.8', '跟車太近': '83.4', '行人前撞': '1.8', '高速前撞': '0.0', '低速前撞': '48.3', '左道偏離': '4.4', '右道偏離': '7.5', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'E 孙洁文', '車牌': 'B03049D', '安全評分': '61.1', '跟車太近': '114.7', '行人前撞': '2.2', '高速前撞': '0.9', '低速前撞': '30.3', '左道偏離': '2.6', '右道偏離': '2.6', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'C 揭绍育', '車牌': 'B02875D', '安全評分': '60.3', '跟車太近': '112.4', '行人前撞': '0.9', '高速前撞': '0.0', '低速前撞': '46.5', '左道偏離': '7.9', '右道偏離': '12.3', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'H 戴辉', '車牌': 'B02875D', '安全評分': '59.7', '跟車太近': '106.4', '行人前撞': '2.6', '高速前撞': '0.0', '低速前撞': '35.2', '左道偏離': '6.7', '右道偏離': '4.1', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'H 赵锋', '車牌': 'B03049D', '安全評分': '58.7', '跟車太近': '167.2', '行人前撞': '3.5', '高速前撞': '0.0', '低速前撞': '59.7', '左道偏離': '3.9', '右道偏離': '3.5', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'B 罗贵翔', '車牌': 'B03049D', '安全評分': '57.2', '跟車太近': '102.0', '行人前撞': '4.4', '高速前撞': '0.0', '低速前撞': '52.8', '左道偏離': '3.5', '右道偏離': '1.8', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'D 方越', '車牌': 'B01339D', '安全評分': '56.4', '跟車太近': '102.0', '行人前撞': '3.5', '高速前撞': '0.0', '低速前撞': '20.0', '左道偏離': '3.5', '右道偏離': '8.7', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'H 钟海志', '車牌': 'B02875D', '安全評分': '55.8', '跟車太近': '143.4', '行人前撞': '3.5', '高速前撞': '1.3', '低速前撞': '44.0', '左道偏離': '1.8', '右道偏離': '3.5', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'H 林兵兵', '車牌': 'B02875D', '安全評分': '54.7', '跟車太近': '126.7', '行人前撞': '1.3', '高速前撞': '0.0', '低速前撞': '30.4', '左道偏離': '11.4', '右道偏離': '17.2', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'D 文强', '車牌': 'B01339D', '安全評分': '54.0', '跟車太近': '140.9', '行人前撞': '4.8', '高速前撞': '0.4', '低速前撞': '67.4', '左道偏離': '3.5', '右道偏離': '3.1', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'K 李寿荣', '車牌': 'B02875D', '安全評分': '52.0', '跟車太近': '125.4', '行人前撞': '2.6', '高速前撞': '1.8', '低速前撞': '40.3', '左道偏離': '7.9', '右道偏離': '7.9', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'B 莫旺伦', '車牌': 'B03015D', '安全評分': '38.5', '跟車太近': '197.1', '行人前撞': '7.0', '高速前撞': '1.8', '低速前撞': '42.1', '左道偏離': '7.0', '右道偏離': '11.4', '急加速': '0.0', '急刹車': '0.0'}, {'司機': 'D 张汉坤', '車牌': 'B01339D', '安全評分': '31.3', '跟車太近': '156.4', '行人前撞': '5.7', '高速前撞': '8.3', '低速前撞': '63.5', '左道偏離': '4.8', '右道偏離': '4.4', '急加速': '0.0', '急刹車': '0.0'}]
      this.rows1Ranking = this.rows1.map(row => Object.assign({}, row)) // clone
      initRows(this, this.rows1, this.columns1)
      initRows(this, this.rows1Ranking, this.columns1)
      this.columns1.forEach((col, i) => {
        if (i > 1) {
          const ranking = this.rows1Ranking.slice(0)
          ranking.sort((a, b) => a[col.name] - b[col.name])
          ranking.reverse()
          let prev = -1
          let rank = 0
          ranking.forEach(row => {
            const cell = parseFloat(row[col.name])
            if (cell !== prev) {
              rank++
            }
            row[col.name] = rank
            prev = cell
          })
        }
      })
      // this.loading = true
      // retry(() => this.$http.get('dao/avg_warning_vrm_grp'))()
      // .then(({data}) => {
      //   this.loading = false
      //   this.rows = data.JSON
      // }).catch((e) => {
      //   this.loading = false
      //   this.$alert('load failed')
      //   throw e
      // })
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
    }
  }
}
</script>
<style lang="scss">
.md-table-cell, .md-table tbody .md-table-row:hover .md-table-cell{
  $total : 17;
  $unit : 255 / $total;
  @for $i from 1 through $total{
    &.rank#{$i}{
      $red : ($i - 1) * $unit;
      background-color: rgb($red, 255 - $red, 30);
    }
  }
}
</style>
