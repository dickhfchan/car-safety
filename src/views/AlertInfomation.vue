<template>
  <datatable>
      <datatable-column v-for="col in columns" :id="'col_'+_uid+'_'+col.name" :label="col.text"></datatable-column>
  </datatable>

</template>
<script>
import Datatable from 'vuetiful/src/components/datatable/datatable.vue'
import DatatableColumn from 'vuetiful/src/components/datatable/datatable-column.vue'

import { titleCase } from 'helper-js'
export default {
  components: {
    Datatable,
    DatatableColumn
  },
  data() {
    return {
      columns: [
        {
          'name': 'wt',
          'text': 'Warning Type'
        },
        {
          'name': 'start_time'
        },
        {
          'name': 'end_time'
        },
        {
          'name': 'duration'
        },
        {
          'name': 'lat',
          'text': 'Warning Type'
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
        }
      ],
      rows: [],
      page: 1,
      pageSize: 5,
      onPagination: (e) => {
        this.page = e.page
        this.alertInfomation.pageSize = e.size
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
    this.$http.get('dao/log_data/21?start_time=2001-08-15+00%3A00%3A00&end_time=2016-08-16+00%3A00%3A00').then(({data}) => {
      this.rows = data.JSON
    })
  },
  // methods:
}
</script>
<style lang="scss">
</style>
