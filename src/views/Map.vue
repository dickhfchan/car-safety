<template>
  <div>
    <md-layout md-gutter>
      <md-layout md-flex-medium="100" md-flex-large="50">
        <md-card class="flex-1 m-a">
          <md-card-header>
            <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
          </md-card-header>
          <md-card-content>
            <GoogleMapTrackRender :ak="$store.state.googleMapAK" :points="points" style="width:100%;"></GoogleMapTrackRender>
          </md-card-content>
        </md-card>
      </md-layout>

      <md-layout md-flex-medium="100" md-flex-large="50">
        <md-card  class="flex-1 m-a">
          <md-table-card>
            <md-card-header>
              <div class="md-title">Alert Information<fullscreen-button></fullscreen-button></div>
            </md-card-header>
            <md-card-content>
              <md-table>
                <md-table-header>
                  <md-table-row>
                    <md-table-head v-for="col in alertInfomation.columns" :key="col.name">{{col.text}}</md-table-head>
                  </md-table-row>
                </md-table-header>

                <md-table-body>
                  <md-table-row v-for="row in visibleRows" key="log_id">
                    <md-table-cell v-for="col in alertInfomation.columns" :key="col.name">{{row[col.name]}}</md-table-cell>
                  </md-table-row>
                </md-table-body>
              </md-table>
              <md-table-pagination
          :md-size="alertInfomation.pageSize"
          :md-page="alertInfomation.page"
          :md-total="alertInfomation.rows.length"
          md-label="Rows"
          md-separator="of"
          :md-page-options="[5, 10, 25, 50]"
          @pagination="alertInfomation.onPagination"
          ></md-table-pagination>
        </md-card-content>
          </md-table-card>
        </md-card>
      </md-layout>
    </md-layout>

    <md-card class="m-a">
      <md-card-header>
        <div class="md-title">Baidu Map<fullscreen-button></fullscreen-button></div>
      </md-card-header>
      <md-card-content>
        <!-- <BaiduMapTrackRender
        :ak="$store.state.baiduMapAK"
        :service-id="$store.state.baiduMapServiceId"
        :points="points"></BaiduMapTrackRender> -->
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import BaiduMapTrackRender from '../components/BaiduMapTrackRender.vue'
import GoogleMapTrackRender from '../components/GoogleMapTrackRender.vue'
import { titleCase } from 'helper-js'
export default {
  components: {
    BaiduMapTrackRender,
    GoogleMapTrackRender
  },
  data() {
    return {
      points: [],
      alertInfomation: {
        columns: [
          {
            'name': 'accuracy'
          },
          {
            'name': 'alt'
          },
          {
            'name': 'bearing'
          },
          {
            'name': 'driver_id'
          },
          {
            'name': 'duration'
          },
          {
            'name': 'end_spd'
          },
          {
            'name': 'end_time'
          },
          {
            'name': 'hw'
          },
          {
            'name': 'lat'
          },
          {
            'name': 'lng'
          },
          {
            'name': 'log_id'
          },
          {
            'name': 'near_hw'
          },
          {
            'name': 'ss'
          },
          {
            'name': 'start_spd'
          },
          {
            'name': 'start_time'
          },
          {
            'name': 'state'
          },
          {
            'name': 'sx'
          },
          {
            'name': 'ti'
          },
          {
            'name': 'top_spd'
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
            'name': 'wt'
          }
        ],
        rows: [],
        page: 1,
        pageSize: 5,
        onPagination: (e) => {
          this.alertInfomation.page = e.page
          this.alertInfomation.pageSize = e.size
        }
      }
    }
  },
  computed: {
    visibleRows() {
      const {rows, page, pageSize} = this.alertInfomation
      const start = (page - 1) * pageSize
      return rows.slice(start, pageSize)
    }
  },
  created() {
    // get google map points
    this.$http.get('google/349').then(({data}) => {
      this.points = data.JSON.map(point => {
        return { lat: point.location.latitude, lng: point.location.longitude }
      })
    })
    // titleCase alertInfomation columns
    for (const col of this.alertInfomation.columns) {
      this.$set(col, 'text', titleCase(col.name))
    }
    // get alertInfomation rows
    this.$http.get('dao/log_data/21?start_time=2001-08-15+00%3A00%3A00&end_time=2016-08-16+00%3A00%3A00').then(({data}) => {
      this.alertInfomation.rows = data.JSON
    })
  }
}
</script>
