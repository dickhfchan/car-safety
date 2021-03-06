<template>
  <md-card  class="m-a card-1 datatables">
    <md-card-content>
      <div class="card-title-wrapper">
        <div class="datatables-select-wrapper">
          <md-select name="datatableSelect" v-model="current" class="datatables-select inline-md">
            <md-option :value="dt.name" v-for="dt in datatables" :key="dt.name">{{dt.text}}</md-option>
          </md-select>
        </div>
        <div class="filters">
          <div class="company-filter" v-if="companyDropDownVisible">
            <label class="m-l grey">{{$t('company')}}:</label>
            <md-select class="m-l-sm inline-md company-select" v-model="company" disabled>
              <md-option :value="null">{{$t('all')}}</md-option>
              <md-option v-for="cpn in companies" :key="cpn.company_id" :value="cpn.company_id">{{cpn.company_name}}</md-option>
            </md-select>
          </div>
        </div>
      </div>

      <div class="relative overflow-hidden-y">
        <Data-Table :rows="filteredRows" :columns="currentColumns"
        :sortBy="currentPrimaryKeyColumn.name" :sortType="dtSortType"
        :pagination="true"
        @edit="edit($event)" @remove="remove"
        ></Data-Table>

        <div class="absolute-backdrop center-wrapper" v-show="loading">
          <md-spinner md-indeterminate></md-spinner>
        </div>
      </div>

      <div class="card-buttons">
        <md-button id="addItem" class="md-icon-button" @click.native="add()">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="bottom">New</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.native="getData()">
          <md-icon>refresh</md-icon>
          <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
        </md-button>
        <fullscreen-button></fullscreen-button>
      </div>

      <md-dialog md-open-from="#addItem" md-close-to="#addItem" ref="dialogAdd"  :md-click-outside-to-close="false" :md-esc-to-close="false">
        <md-dialog-title>New Item</md-dialog-title>
        <md-dialog-content>
          <form novalidate @submit.stop.prevent="saveNew()">
            <md-layout :md-gutter="16">
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name" v-if="field.addVisible">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-if="!field.addType" v-model="newRow[field.name]" :disabled="field.addDisabled" :required="field.required"></md-input>
                  <md-select v-else-if="field.addType==='select'" v-model="newRow[field.name]" :disabled="field.addDisabled" :required="field.required">
                    <md-option v-for="option in field.addOptions" :key="option" :value="option[field.addOptionValueKey]">{{option[field.addOptionTextKey]}}</md-option>
                  </md-select>
                  <template v-else-if="field.addType==='datetime'">
                    <md-input v-model="newRow[field.name]" :required="field.required"></md-input>
                    <date-picker v-model="newRow[field.name]" :language="$store.state.lang == 'en' ? 'en' : 'ch'" :range="false"></date-picker>
                  </template>
                </md-input-container>
              </md-layout>
            </md-layout>
            <div class="flex">
              <div class="flex-1"></div>
              <md-button class="md-primary" @click.native="closeDialogAdd()">Cancel</md-button>
              <md-button class="md-primary" type="submit">Save</md-button>
            </div>
          </form>
        </md-dialog-content>
      </md-dialog>

      <md-dialog ref="dialogEdit" :md-click-outside-to-close="false" :md-esc-to-close="false">
        <md-dialog-title>Edit Item</md-dialog-title>
        <md-dialog-content>
          <form novalidate @submit.stop.prevent="saveEditing()">
            <md-layout :md-gutter="16">
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name" v-if="field.editVisible">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-if="!field.editType" v-model="editingRow[field.name]" :disabled="field.editDisabled" :required="field.required"></md-input>
                  <md-select v-else-if="field.editType==='select'" v-model="editingRow[field.name]" :disabled="field.editDisabled" :required="field.required">
                    <md-option v-for="option in field.editOptions" :key="option" :value="option[field.editOptionValueKey]">{{option[field.editOptionTextKey]}}</md-option>
                  </md-select>
                </md-input-container>
              </md-layout>
            </md-layout>
            <div class="flex">
              <div class="flex-1"></div>
              <md-button class="md-primary" @click.native="closeDialogEdit()">Cancel</md-button>
              <md-button class="md-primary" type="submit">Save</md-button>
            </div>
          </form>
        </md-dialog-content>
      </md-dialog>

    </md-card-content>
  </md-card>
</template>
<script>
import Vue from 'vue'
import DataTable0 from '../components/DataTable.vue'
import ActionsCell from '../components/DatatablesActionsCell.vue'
import DatePicker from '../components/DatePicker.vue'
import { titleCase, isPromise } from 'helper-js'
import { format } from 'date-functions'
import { dateTimeFields, getRowData, axiosAutoProxy, beforeSave } from '../utils.js'

const DataTable = {
  extends: DataTable0,
  components: { ActionsCell },
}

export default {
  components: { DatePicker, DataTable },
  data() {
    const data = {
      title: this.$t('settings'),
      company: this.$store.state.user.company_id,
      dtSortType: 'desc',
      datatables: {
        'driver': {
          'columns': [
            {
              'name': 'driver_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'group_id',
              text: 'Group',
              visible: false,
              required: true,
              addType: 'select',
              editType: 'select',
              addOptions: null,
              addOptionValueKey: 'drv_grp_id',
              addOptionTextKey: 'grp_alias',
              editOptions: null,
              editOptionValueKey: 'drv_grp_id',
              editOptionTextKey: 'grp_alias',
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user',
              visible: false,
              addVisible: false,
              editVisible: false,
            },
            {
              'name': 'dob'
            },
            {
              'name': 'driver_code'
            },
            {
              'name': 'is_default'
            },
            {
              'name': 'name'
            },
            {
              'name': 'phone_home'
            },
            {
              'name': 'phone_mobile'
            },
            {
              'name': 'phone_office'
            },
            {
              'name': 'update_user',
              visible: false,
            },
            {
              'name': 'version',
              visible: false,
              addVisible: false,
              editDisabled: false,
            }
          ],
          getGroup: () => {
            if (!this._driverGroupForDriver) {
              return this.$http.get('dao/driver_group').then(({data}) => {
                this._driverGroupForDriver = data.JSON.filter(item => item.company_id === this.$store.state.user.company_id)
                return this._driverGroupForDriver
              })
            } else {
              return Promise.resolve(this._driverGroupForDriver)
            }
          },
          oncreating: (newRow) => {
            // delete newRow.driver_id // nonecessary
            const dt = this.datatables.driver
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.addOptions = data
            })
          },
          onediting: (rowData) => {
            const dt = this.datatables.driver
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.editOptions = data
            })
          },
          ongettingData: () => { this.getGroupDtl = this.$http.get('dao/driver_group_dtl') },
          afterGetData: (rows) => {
            this.getGroupDtl.then(({data}) => {
              const mapping = {}
              data.JSON.forEach(item => { mapping[item.driver_id] = item.drv_grp_id })
              rows.forEach(row => { row.group_id = mapping[row.driver_id] })
            })
          },
          beforeSaveNew: (row) => {
            const groupId = row.group_id
            delete row.group_id
            return this.$http.post('dao/driver_group_dtl', { drv_grp_dtl_id: null, drv_grp_id: groupId, driver_id: row.driver_id, version: 0 })
          },
          beforeSaveEditing: (row) => {
            const groupId = row.group_id
            delete row.group_id
            // mapping
            return this.getGroupDtl.then(({data}) => {
              const mapping = data.JSON.find(v => v.driver_id === row.driver_id)
              const oldGroupId = mapping && mapping.drv_grp_id
              const oldMappingId = mapping && mapping.drv_grp_dtl_id
              if (oldGroupId !== groupId) {
                return this.$http.post('dao/driver_group_dtl', { drv_grp_dtl_id: oldMappingId || null, drv_grp_id: groupId, driver_id: row.driver_id, version: 0 }) // insert or update mapping
              }
            })
          },
        },
        'driver_group': {
          'columns': [
            {
              'name': 'drv_grp_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'grp_alias'
            },
            {
              'name': 'grp_descpt'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            }
          ],
          // reset _driverGroupForDriver
          beforeSaveNew: () => { this._driverGroupForDriver = null },
          beforeSaveEditing: () => { this._driverGroupForDriver = null },
          beforeDelete: () => { this._driverGroupForDriver = null },
        },
        'driver_group_dtl': {
          'columns': [
            {
              'name': 'drv_grp_dtl_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'driver_id'
            },
            {
              'name': 'drv_grp_id'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            }
          ]
        },
        // 'mob_device': {
        //   'columns': [
        //     {
        //       'name': 'active_end_date'
        //     },
        //     {
        //       'name': 'active_start_date'
        //     },
        //     {
        //       'name': 'apps_id'
        //     },
        //     {
        //       'name': 'apps_timezone'
        //     },
        //     {
        //       'name': 'apps_ts'
        //     },
        //     {
        //       'name': 'apps_ver_no'
        //     },
        //     {
        //       'name': 'company_id'
        //     },
        //     {
        //       'name': 'create_user'
        //     },
        //     {
        //       'name': 'last_access_ts'
        //     },
        //     {
        //       'name': 'last_loc_update_ts'
        //     },
        //     {
        //       'name': 'lat'
        //     },
        //     {
        //       'name': 'lng'
        //     },
        //     {
        //       'name': 'md_id'
        //     },
        //     {
        //       'name': 'md_sn'
        //     },
        //     {
        //       'name': 'status'
        //     },
        //     {
        //       'name': 'update_user'
        //     },
        //     {
        //       'name': 'version',
        //       'visible': false
        //     },
        //     {
        //       'name': 'vrm_id'
        //     }
        //   ]
        // },
        'user_account': {
          'columns': [
            {
              'name': 'user_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'group_id',
              text: 'Group',
              visible: false,
              required: true,
              addType: 'select',
              editType: 'select',
              addOptions: null,
              addOptionValueKey: 'group_id',
              addOptionTextKey: 'group_name',
              editOptions: null,
              editOptionValueKey: 'group_id',
              editOptionTextKey: 'group_name',
            },
            {
              name: 'groupDisplayInTable',
              text: 'Group',
              addVisible: false,
              editVisible: false,
              notInDatabase: true,
            },
            {
              'name': 'fullname'
            },
            {
              'name': 'lang'
            },
            {
              'name': 'last_login_ts',
            },
            {
              'name': 'map'
            },
            {
              'name': 'password'
            },
            {
              'name': 'retry_count'
            },
            {
              'name': 'status'
            },
            {
              'name': 'username'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            }
          ],
          getGroup: () => {
            if (!this._userGroupForUser) {
              return this.$http.get('dao/user_group').then(({data}) => {
                this._userGroupForUser = data.JSON.filter(item => item.company_id === this.$store.state.user.company_id)
                return this._userGroupForUser
              })
            } else {
              return Promise.resolve(this._userGroupForUser)
            }
          },
          oncreating: (newRow) => {
            const dt = this.datatables.user_account
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.addOptions = data
            })
            newRow.last_login_ts = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
          },
          onediting: (rowData) => {
            const dt = this.datatables.user_account
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.editOptions = data
            })
          },
          ongettingData: () => { this.datatables.user_account.getGroup() },
          afterGetData: (rows) => {
            const dt = this.datatables.user_account
            dt.getGroup().then(groups => {
              const mapping = {}
              groups.forEach(grp => { mapping[grp.group_id] = grp.group_name })
              rows.forEach(row => {
                this.$set(row, 'groupDisplayInTable', mapping[row.group_id])
              })
            })
          },
        },
        'user_group': {
          'columns': [
            {
              'name': 'group_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'group_name'
            }
          ],
          // reset _userGroupForUser
          beforeSaveNew: () => { this._userGroupForUser = null },
          beforeSaveEditing: () => { this._userGroupForUser = null },
          beforeDelete: () => { this._userGroupForUser = null },
        },
        'user_group_func': {
          'columns': [
            {
              'name': 'group_func_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'func_code'
            },
            {
              'name': 'group_id'
            }
          ]
        },
        // 'users': {
        //   'columns': [
        //     {
        //       'name': 'company'
        //     },
        //     {
        //       'name': 'def_lang'
        //     },
        //     {
        //       'name': 'def_map'
        //     },
        //     {
        //       'name': 'first_name'
        //     },
        //     {
        //       'name': 'id'
        //     },
        //     {
        //       'name': 'last_name'
        //     },
        //     {
        //       'name': 'login_name'
        //     },
        //     {
        //       'name': 'password'
        //     }
        //   ]
        // },
        // 'vehicle': {
        //   'columns': [
        //     {
        //       'name': 'brand',
        //     },
        //     {
        //       'name': 'company_id',
        //     },
        //     {
        //       'name': 'create_user',
        //     },
        //     {
        //       'name': 'fuel_usage',
        //     },
        //     {
        //       'name': 'idle_duration_non-trf',
        //     },
        //     {
        //       'name': 'idle_duration_trf',
        //     },
        //     {
        //       'name': 'latest_trip_distance',
        //     },
        //     {
        //       'name': 'latest_trip_duration',
        //     },
        //     {
        //       'name': 'model',
        //     },
        //     {
        //       'name': 'run_distance',
        //     },
        //     {
        //       'name': 'run_duration',
        //     },
        //     {
        //       'name': 'update_user',
        //     },
        //     {
        //       'name': 'vehicle_id',
        //     },
        //     {
        //       'name': 'year',
        //     },
        //     {
        //       'name': 'version',
        //       'visible': false
        //     },
        //   ],
        // },
        'veh_reg_mark': {
          'columns': [
            {
              'name': 'vrm_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'group_id',
              text: 'Group',
              visible: false,
              required: true,
              addType: 'select',
              editType: 'select',
              addOptions: null,
              addOptionValueKey: 'vrm_grp_id',
              addOptionTextKey: 'grp_alias',
              editOptions: null,
              editOptionValueKey: 'vrm_grp_id',
              editOptionTextKey: 'grp_alias',
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'def_drv_id'
            },
            {
              'name': 'status'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'vehicle_id'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            },
            {
              'name': 'vrm_mark_code'
            }
          ],
          getGroup: () => {
            if (!this._vehiclerGroupForVehicle) {
              return this.$http.get('dao/veh_reg_mark_group').then(({data}) => {
                this._vehiclerGroupForVehicle = data.JSON.filter(item => item.company_id === this.$store.state.user.company_id)
                return this._vehiclerGroupForVehicle
              })
            } else {
              return Promise.resolve(this._vehiclerGroupForVehicle)
            }
          },
          oncreating: (newRow) => {
            // delete newRow.vrm_id // nonecessary
            const dt = this.datatables.veh_reg_mark
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.addOptions = data
            })
          },
          onediting: (rowData) => {
            const dt = this.datatables.veh_reg_mark
            dt.getGroup().then(data => {
              const col = dt.columns.find(c => c.name === 'group_id')
              col.editOptions = data
            })
          },
          ongettingData: () => { this.getGroupDtl = this.$http.get('dao/veh_reg_mark_group_dtl') },
          afterGetData: (rows) => {
            this.getGroupDtl.then(({data}) => {
              const mapping = {}
              data.JSON.forEach(item => { mapping[item.vrm_id] = item.vrm_grp_id })
              rows.forEach(row => { row.group_id = mapping[row.vrm_id] })
            })
          },
          beforeSaveNew: (row) => {
            const groupId = row.group_id
            delete row.group_id
            return this.$http.post('dao/veh_reg_mark_group_dtl', { vrm_grp_dtl_id: null, vrm_grp_id: groupId, vrm_id: row.vrm_id, version: 0 })
          },
          beforeSaveEditing: (row) => {
            const groupId = row.group_id
            delete row.group_id
            // mapping
            return this.getGroupDtl.then(({data}) => {
              const mapping = data.JSON.find(v => v.vrm_id === row.vrm_id)
              const oldGroupId = mapping && mapping.vrm_grp_id
              const oldMappingId = mapping && mapping.vrm_grp_dtl_id
              if (oldGroupId !== groupId) {
                return this.$http.post('dao/veh_reg_mark_group_dtl', { vrm_grp_dtl_id: oldMappingId || null, vrm_grp_id: groupId, vrm_id: row.vrm_id, version: 0 }) // insert or update mapping
              }
            })
          },
        },
        'veh_reg_mark_group': {
          'columns': [
            {
              'name': 'vrm_grp_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'grp_alias'
            },
            {
              'name': 'grp_descpt'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            },
          ],
          // reset _driverGroupForDriver
          beforeSaveNew: () => { this._vehiclerGroupForVehicle = null },
          beforeSaveEditing: () => { this._vehiclerGroupForVehicle = null },
          beforeDelete: () => { this._vehiclerGroupForVehicle = null },
        },
        'veh_reg_mark_group_dtl': {
          'columns': [
            {
              'name': 'vrm_grp_dtl_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            },
            {
              'name': 'vrm_grp_id'
            },
            {
              'name': 'vrm_id'
            }
          ]
        },
        // 'warning_type': {
        //   'columns': [
        //     {
        //       'name': 'warn_type_code',
        //     },
        //     {
        //       'name': 'warn_type_id',
        //     }
        //   ],
        // }
        ui_geofence_setup: {
          columns: [
            {
              'name': 'geofence_id',
              addVisible: false,
              editDisabled: true,
              primaryKey: true,
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'geofence'
            },
            {
              'name': 'geofence_baidu'
            },
            {
              'name': 'remark'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            },
          ]
        }
      },
      rows: [],
      current: 'driver',
      loading: false,
      newRow: {},
      editingRow: {},
    }
    // add actions col, set for datatable with company_id
    for (const key in data.datatables) {
      const dt = data.datatables[key]
      dt.columns.splice(0, 0, {
        name: 'actions',
        type: 'actions',
        sortAble: false,
        cellClass: 'datatables-actions',
        addVisible: false,
        editVisible: false,
        notInDatabase: true,
      })
      dt.columns.forEach(col => {
        if (dateTimeFields.includes(col.name)) {
          col.valueProcessor = ({value}) => format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
        }
      })
      // set company_id
      const colCompanyId = dt.columns.find(v => v.name === 'company_id')
      if (colCompanyId) {
        colCompanyId.addDisabled = true
        colCompanyId.editDisabled = true
        const oldC = dt.oncreating
        dt.oncreating = (data) => {
          data.company_id = this.$store.state.user.company_id
          oldC && oldC(data)
        }
      }
      // invisible create user, update user
      dt.columns.forEach(col => {
        if (col.name === 'create_user' || col.name === 'update_user') {
          Object.assign(col, {
            visible: false,
            addVisible: false,
            editVisible: false,
          })
        }
      })
    }
    // init datatables
    for (const key in data.datatables) {
      const dt = data.datatables[key]
      if (!dt.name) {
        dt.name = key
      }
      if (!dt.text) {
        dt.text = titleCase(dt.name)
      }
      dt.columns.forEach(col => {
        if (!col.hasOwnProperty('addVisible')) {
          col.addVisible = true
        }
        if (!col.hasOwnProperty('editVisible')) {
          col.editVisible = true
        }
      })
    }
    return data
  },
  computed: {
    currentTable() { return this.datatables[this.current] },
    currentColumns() { return this.currentTable.columns },
    currentPrimaryKeyColumn() { return this.currentColumns.find(col => col.primaryKey) },
    api() { return `dao/${this.current}` },
    companies() { return this.$store.state.companies },
    companyDropDownVisible() { return this.currentColumns.find(v => v.name === 'company_id') },
    filteredRows() {
      if (this.companyDropDownVisible && this.company != null) {
        return this.rows.filter(row => row.company_id === this.company)
      } else {
        return this.rows
      }
    },
  },
  watch: {
    current: {
      immediate: true,
      handler(val, oldVal) {
        this.rows = []
        this.dtSortType = 'desc'
        this.getData()
      }
    },
  },
  created() {
    // get datatables with columns
    // const dataTables = {}
    // for (const key in this.datatables) {
    //   // const dt = this.datatables[key]
    //   dataTables[key] = null
    //   this.$http.get('dao/' + key).then(({data}) => {
    //     if (data.JSON[0]) {
    //       dataTables[key] = Object.keys(data.JSON[0]).filter(v => v !== 'create_ts' && v !== 'update_ts')
    //       dataTables[key] = {
    //         columns: dataTables[key].map(v => {
    //           return { name: v }
    //         })
    //       }
    //     } else {
    //       dataTables[key] = this.datatables[key]
    //     }
    //     // if (dataTables[key].indexOf('version')) {
    //     //   console.log(key)
    //     // }
    //   })
    // }
    // window.dataTablesGot = () => {
    //   for (var k in dataTables) {
    //     dataTables[k].columns.forEach(v => {
    //       if (v.name === 'version') {
    //         v.visible = false
    //       }
    //     })
    //   }
    // }
    // window.dataTables = dataTables
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    async getData(table) {
      // cancel prev request
      if (this.cancelPrevgetDataRequest) {
        this.cancelPrevgetDataRequest()
        this.cancelPrevgetDataRequest = null
      }
      const CancelToken = Vue.Axios.CancelToken
      this.loading = true
      const t = this.currentTable.ongettingData && this.currentTable.ongettingData()
      if (isPromise(t)) {
        await t
      }
      this.$http.get(this.api, {
        cancelToken: new CancelToken((c) => { this.cancelPrevgetDataRequest = c }),
      })
      .then(async ({data}) => {
        const t = this.currentTable.afterGetData && this.currentTable.afterGetData(data.JSON)
        if (isPromise(t)) {
          await t
        }
        this.rows = data.JSON
        this.loading = false
      }).catch((e) => {
        if (!e.__CANCEL__) {
          this.loading = false
          this.$alert('load data failed')
          throw e
        }
      })
    },
    add() {
      const newRow = {}
      this.currentColumns.forEach(col => { newRow[col.name] = null })
      this.currentTable.oncreating && this.currentTable.oncreating(newRow)
      if (newRow.hasOwnProperty('version')) {
        newRow.version = 0
      }
      this.newRow = newRow
      this.$refs.dialogAdd.open()
    },
    validate(data) {
      const requiredButEmpty = this.currentColumns.find(col => col.required && (data[col.name] == null || data[col.name] === ''))
      if (requiredButEmpty) {
        this.$alert(`${requiredButEmpty.text} is required`)
        return false
      } else {
        return true
      }
    },
    async saveNew() {
      const newRow = Object.assign({}, this.newRow)
      if (!this.validate(newRow)) {
        return
      }
      try {
        beforeSave(newRow, this.currentColumns)
      } catch (e) {
        this.$alert(e.message)
        return
      }
      const t = this.currentTable.beforeSaveNew && this.currentTable.beforeSaveNew(newRow)
      if (t) {
        if (isPromise(t)) {
          await t
        }
      }
      axiosAutoProxy(this.$http, this.api, 'post', newRow).then(({data}) => {
        if (data.indexOf('error') === 0) {
          this.$alert(this.$t('failed'))
        } else if (data.toLowerCase().indexOf('succe') > -1) {
          this.$alert(this.$t('succeeded'))
          this.$refs.dialogAdd.close()
          this.getData()
        } else {
          this.$alert(data)
        }
      })
    },
    closeDialogAdd() {
      this.newRow = {}
      this.$refs.dialogAdd.close()
    },
    edit(row) {
      const rowData = getRowData(row, this.currentColumns)
      this.currentTable.onediting && this.currentTable.onediting(rowData)
      this.editingRow = rowData
      this.$refs.dialogEdit.open()
    },
    async saveEditing() {
      const editingRow = Object.assign({}, this.editingRow)
      if (!this.validate(editingRow)) {
        return
      }
      const t = this.currentTable.beforeSaveEditing && this.currentTable.beforeSaveEditing(editingRow)
      if (t) {
        if (isPromise(t)) {
          await t
        }
      }
      try {
        beforeSave(editingRow, this.currentColumns)
      } catch (e) {
        this.$alert(e.message)
        return
      }
      axiosAutoProxy(this.$http, this.api, 'post', editingRow).then(({data}) => {
        if (data.indexOf('error') === 0) {
          this.$alert(this.$t('failed'))
        } else if (data.toLowerCase().indexOf('succe') > -1) {
          this.$alert(this.$t('succeeded'))
          this.$refs.dialogEdit.close()
          this.getData()
        } else {
          this.$alert(data)
        }
      })
    },
    closeDialogEdit() {
      this.editingRow = {}
      this.$refs.dialogEdit.close()
    },
    remove(row) {
      this.$confirm('Are you sure to remove specified item?').then(async () => {
        const t = this.currentTable.beforeDelete && this.currentTable.beforeDelete(row)
        if (t) {
          if (isPromise(t)) {
            await t
          }
        }
        axiosAutoProxy(this.$http, this.api, 'delete', row).then(({data}) => {
          if (data.indexOf('error') === 0) {
            this.$alert(this.$t('failed'))
          } else if (data.toLowerCase().indexOf('succe') > 0) {
            this.$alert(this.$t('succeeded'))
            this.getData()
            this.currentTable.afterDelete && this.currentTable.afterDelete()
          } else {
            this.$alert(data)
          }
        })
      }).catch(e => {
        if (e.message.toLowerCase() !== 'cancel') {
          throw e
        }
      })
    },
    save() {
      // this.modified = false
      // this.newRow = null
    },
    saved() {
    },
  }
}
</script>
<style lang="scss">
.datatables{
  .card-title-wrapper{
    display: flex;
    height: 41px;
    padding-left: 5px;
    align-items: center;
  }

  .datatables-select-wrapper{
    display: flex;
    align-items: center;
  }
  .datatables-select{
    .md-select-value{
      font-size: 20px;
    }
  }
  //
  .filters{
    display: inline-block;
  }
  .company-filter{
    display: flex;
    align-items: center;
  }
  .company-select{
    .md-select-value{
      font-size: 14px;
      color: grey;
    }
  }
  .datatables-actions.md-table-cell-container{
    padding-left: 0px!important;
    padding-right: 0px!important;
    justify-content: flex-start!important;
  }
}
</style>
