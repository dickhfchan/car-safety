<template>
  <md-table>
    <md-table-header>
      <md-table-row>
        <md-table-head v-for="col in columns" :key="col.name">{{col.text}}</md-table-head>
      </md-table-row>
    </md-table-header>

    <md-table-body>
      <md-table-row v-for="row in rows" :key="row.log_id">
        <md-table-cell v-for="col in columns" :key="col.name">{{row[col.name]}}</md-table-cell>
      </md-table-row>
    </md-table-body>
  </md-table>
</template>
<script>
import { titleCase, retry } from 'helper-js'
import { format } from 'date-functions'
export default {
  data() {
    return {
      warningTypes: null,
      columns: [
        {
          'name': 'Warning',
          'text': 'Warning',
          valueProcessor: ({row}) => this.warningTypes[row.wt]
        },
        {
          'name': 'start_time',
          valueProcessor: ({value}) => format(new Date(value), 'MM-dd HH:mm')
        },
        {
          'name': 'end_time',
          valueProcessor: ({value}) => format(new Date(value), 'MM-dd HH:mm')
        },
        {
          'name': 'duration'
        },
        {
          'name': 'alt',
          'text': 'Latitude'
        },
        {
          'name': 'lng',
          'text': 'Longitude'
        },
        {
          'name': 'start_spd',
          'text': 'Start Speed'
        },
        {
          'name': 'end_spd',
          'text': 'End Speed'
        },
        {
          'name': 'top_spd',
          'text': 'Top Speed'
        },
        {
          'name': 'ti',
          'text': 'TI'
        },
        {
          'name': 'hw',
          'text': 'HW'
        },
        {
          'name': 'near_hw',
          'text': 'Near HW'
        },
        {
          'name': 'ss',
          'text': 'SS'
        },
        {
          'name': 'sx',
          'text': 'SX'
        },
        {
          'name': 'accuracy'
        },
        {
          'name': 'bearing'
        },
        {
          'name': 'driver_id'
        },
        {
          'name': 'log_id'
        },
        {
          'name': 'state'
        },
        {
          'name': 'upload_id'
        },
        {
          'name': 'vrm_id'
        },
        {
          'name': 'warning_vdo_id'
        },
        {
          'name': 'warning_vdo_ready'
        },
        {
          'name': 'lat',
        },
      ],
      cache: {
        rows: []
      },
    }
  },
  computed: {
    rows: {
      get() { return this.cache.rows },
      set(rows) {
        this.columns
        .filter(col => col.valueProcessor)
        .forEach(col => {
          rows.forEach(row => { row[col.name] = col.valueProcessor({value: row[col.name], col, row, rows}) })
        })
        this.cache.rows = rows
      }
    }
  },
  created() {
    // auto generate column display name
    for (const col of this.columns) {
      if (!col.text) {
        this.$set(col, 'text', titleCase(col.name))
      }
    }
    // get rows
    this.getData()
  },
  methods: {
    getData() {
      const getWarningTypes = this.warningTypes == null ? this.getWarningTypes() : Promise.resolve()
      const getLogData = retry(() => this.$http.get(`dao/log_data/21?start_time=2005-01-01+00%3A00%3A00&end_time=2016-01-30+00%3A00%3A00`))
      return Promise.all([getWarningTypes, getLogData()]).then((data) => {
        const response = data[1]
        this.rows = response.data.JSON
      }).catch((e) => {
        window.alert('get alert infomation failed')
        throw e
      })
    },
    getWarningTypes() {
      const func = retry(() => this.$http.get('dao/warning_type'))
      return func().then(({data}) => {
        const warningTypes = {}
        data.JSON.forEach(item => { warningTypes[item.warn_type_id] = item.warn_type_code })
        this.warningTypes = warningTypes
      }).catch((e) => {
        window.alert('get warning types failed')
        throw e
      })
    }
  }
}

</script>
<style lang="scss">
</style>
