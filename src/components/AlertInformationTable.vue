<template>
  <div class="alert-information-table md-table md-theme-default">
    <table>
      <thead class="md-table-header">
        <tr class="md-table-row1">
          <!---->
          <th class="md-table-head md-sorted" v-for="col in columns" v-if="col.visible" :key="col.name">
            <div class="md-table-head-container">
              <div class="md-table-head-text md-test">{{col.text}}</div>
              <!-- <div class="md-ink-ripple">
                <div class="md-ripple"></div>
              </div> -->
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="md-table-body">
        <tr class="md-table-row"  v-for="row in rows" :key="row.log_id" :class="{active: row.active}">
          <!---->
          <td class="md-table-cell" v-for="col in columns" v-if="col.visible" :key="col.name" :class="{'md-has-action':col.name==='warning_vdo_id' && row.warning_vdo_ready==='Y'}">
            <div class="md-table-cell-container">
              <span v-if="col.name!=='warning_vdo_id'">{{row[col.name]}}</span>
              <md-button class="md-icon-button" v-if="col.name==='warning_vdo_id' && row.warning_vdo_ready==='Y'" @click.native="playAlertVideo(row)">
                <md-icon>ondemand_video</md-icon>
              </md-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  // components:
  props: ['columns', 'rows'],
  data() {
    return {

    }
  }
  // methods:
}
</script>
<style lang="scss">
</style>
