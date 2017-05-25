<template>
  <div id="app" class="container">
    <Login v-if="!$store.state.authenticated"></Login>
    <template v-else>
      <md-whiteframe class="menu-layer">
        <md-toolbar md-theme="blue">
          <md-button class="md-icon-button" @click.native="toggleLeftSidenav">
            <md-icon>menu</md-icon>
          </md-button>

          <h2 class="md-title">{{$t('brand')}}</h2>

          <Map-Filters v-if="$route.name === 'map'"></Map-Filters>
          <Date-Range-Picker-In-Top v-else-if="$route.name === 'd2'" v-model="dateRangeInD2" class="d2-date-range"></Date-Range-Picker-In-Top>
          <div v-else-if="$route.name === 'report2'"  class="report2-select-wrapper">
            <label for="vehicle_select" class="m-r-sm">{{$t('driver')}}</label>
            <Select2 :options="$store.state.report2Drivers" value-key="driver_id" text-key="name" v-model="report2DriverId"></Select2>
            <Date-Range-Picker-In-Top v-model="dateRangeInReport2" class="m-l report2-date-range"></Date-Range-Picker-In-Top>
          </div>
          <span v-else class="flex-1"></span>

          <md-button class="md-icon-button" @click.native="">
           <md-icon>apps</md-icon>
           <md-tooltip md-direction="bottom">{{$t('nineBoxes')}}</md-tooltip>
          </md-button>

          <md-button class="md-icon-button" @click.native="">
           <md-icon>notifications</md-icon>
           <md-tooltip md-direction="bottom">{{$t('notifications')}}</md-tooltip>
          </md-button>

          <!-- <md-button class="md-icon-button" @click.native="toggleRightSidenav">
           <md-icon>settings</md-icon>
           <md-tooltip md-direction="bottom">{{$t('setting')}}</md-tooltip>
          </md-button> -->

          <md-avatar @click.native="toggleRightSidenav">
            <img src="./assets/img/avatar.png" alt="Avatar">
            <md-tooltip md-direction="bottom">{{$t('profile')}}</md-tooltip>
          </md-avatar>

        </md-toolbar>
      </md-whiteframe>

      <!-- left side -->
      <md-sidenav md-theme="blue" class="md-left sidebar-layer left-side-bar" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
          <md-toolbar class="md-large logo-wrapper" md-theme="white">
            <router-link :to="{name: 'dashboard'}">
              <img src="./assets/img/webwxgetmsgimgg.jpg" alt="Vue">
            </router-link>
          </md-toolbar>
          <div class="" style="">
            <md-list>
              <template v-for="(item, index) in $store.state.menu">
                <md-list-item v-if="item.children">
                  <md-icon>{{item.icon}}</md-icon>
                  <span>{{$t(item.text)}}</span>
                  <md-list-expand>
                   <md-list>
                     <md-list-item class="md-inset" v-for="childItem in item.children" :key="childItem.name"
                     :href="$router.resolve({name:item.routeName}).href"
                      @click.native.prevent="onMenuItemClik(childItem)"
                      >
                      {{$t(childItem.text)}}
                     </md-list-item>
                   </md-list>
                 </md-list-expand>
                </md-list-item>
                <md-list-item v-else
                :href="$router.resolve({name:item.routeName}).href"
                 @click.native.prevent="onMenuItemClik(item)"
                >
                  <md-icon>{{item.icon}}</md-icon>
                  <span>{{$t(item.text)}}</span>
                </md-list-item>
              </template>
            </md-list>
          </div>

      </md-sidenav>

      <!-- right side -->
      <md-sidenav md-theme="blue" class="md-right sidebar-layer" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
          <md-toolbar class="">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('profile')}}</h3>
            </div>
          </md-toolbar>
          <div class="p-a">
            <span>{{$store.state.user.fullname}}</span>
            <br>
            <a href="#" @click.prevent="$store.dispatch('logout')">{{$t('logout')}}</a>
          </div>
          <form novalidate @submit.stop.prevent="updateSettings">
            <md-subheader class="md-inset">{{$t('settings')}}</md-subheader>
            <div style="padding:0 1em;">
              <md-input-container>
                <label for="mapSelect">{{$t('map')}}</label>
                <md-select name="map" id="mapSelect" v-model="settings.map">
                  <md-option value="googleMap">{{$t('googleMap')}}</md-option>
                  <md-option value="baiduMap">{{$t('baiduMap')}}</md-option>
                </md-select>
              </md-input-container>
              <md-input-container>
                <label for="langSelect">{{$t('language')}}</label>
                <md-select name="lang" id="langSelect" v-model="settings.lang">
                  <md-option value="en">{{$t('Englsih')}}</md-option>
                  <md-option value="zh-cn">{{$t('simplifiedChinese')}}</md-option>
                  <md-option value="zh-tw">{{$t('traditionalChinese')}}</md-option>
                </md-select>
              </md-input-container>
            </div>
            <md-button class="md-raised md-primary" type="submit">{{$t('update')}}</md-button>
          </form>

      </md-sidenav>

      <div class="page-content main-layer">
        <keep-alive>
           <router-view></router-view>
        </keep-alive>
      </div>
    </template>

    <!-- global alert -->
    <md-dialog-alert :md-content="alert.content" :md-ok-text="$t('ok')" ref="alert"></md-dialog-alert>

    <!-- global confirm -->
    <md-dialog-confirm
      :md-title="confirm.title"
      :md-content-html="confirm.content"
      :md-ok-text="confirm.ok"
      :md-cancel-text="confirm.cancel"
      @close="onConfirmClose"
      ref="confirm">
    </md-dialog-confirm>
  </div>
</template>

<script>
import Login from '@/components/Login.vue'
import MapFilters from '@/components/MapFilters.vue'
import DateRangePickerInTop from '@/components/DateRangePickerInTop.vue'
import Select2 from '@/components/Select2.vue'

export default {
  components: { Login, MapFilters, DateRangePickerInTop, Select2 },
  data () {
    const state = this.$store.state
    return {
      settings: {
        map: state.map,
        lang: state.lang,
      },
      alert: {
        content: ' '
      },
      confirm: {
        title: '',
        content: ' ',
        ok: this.$t('ok'),
        cancel: this.$t('cancel'),
        resolve: null,
        reject: null,
      }
    }
  },
  computed: {
    dateRangeInD2: {
      get() { return this.$store.state.dateRangeInD2 },
      set(value) { this.$store.commit('dateRangeInD2', value) },
    },
    report2DriverId: {
      get() { return this.$store.state.report2DriverId },
      set(value) { this.$store.commit('report2DriverId', value) },
    },
    dateRangeInReport2: {
      get() { return this.$store.state.dateRangeInReport2 },
      set(value) { this.$store.commit('dateRangeInReport2', value) },
    },
  },
  methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle()
    },
    toggleRightSidenav() {
      this.$refs.rightSidenav.toggle()
    },
    closeRightSidenav() {
      this.$refs.rightSidenav.close()
    },
    open(ref) {
      console.log('Opened: ' + ref)
    },
    close(ref) {
      console.log('Closed: ' + ref)
    },
    onMenuItemClik(item) {
      if (item.routeName) {
        this.$router.push({name: item.routeName})
      }
    },
    updateSettings() {
      this.$store.commit('map', this.settings.map)
      window.localStorage.setItem('lang_' + this.$store.state.user.company_id, this.settings.lang)
      this.$store.commit('lang', this.settings.lang)
      this.closeRightSidenav()
    },
    onConfirmClose(type) {
      if (type === 'ok') {
        if (this.confirm.resolve) {
          this.confirm.resolve()
        }
      } else if (type === 'cancel') {
        if (this.confirm.reject) {
          this.confirm.reject(new Error('cancel'))
        }
      }
    }
  },
  created() {
    const Vue = this.$root.constructor
    // register alert
    Vue.alert = Vue.prototype.$alert = (content) => {
      this.alert.content = content
      this.$refs.alert.open()
    }
    // register confirm
    Vue.confirm = Vue.prototype.$confirm = (content, options) => {
      this.confirm.content = content
      if (options) {
        Object.assign(this.confirm, options)
      }
      if (!this.confirm.title) {
        this.confirm.title = this.$t('confirm')
      }
      this.$refs.confirm.open()
      return new Promise((resolve, reject) => {
        this.confirm.resolve = resolve
        this.confirm.reject = reject
      })
    }
  }
}

</script>

<!-- base -->
<style lang="scss">
// <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
@import "./assets/css/google-font.css";
// <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
@import "./assets/css/google-icon-font.css";
// the css about svg in vue-material.css will effect baidu map overlays, add svg{max-width: inherit;} to prevent that (already added in baidu-map-track-render-vue )
@import "../node_modules/vue-material/dist/vue-material.css";
// layer.scss should after vue-material.css
@import "./assets/css/layer.scss";
@import "../node_modules/css-spacing-helper/css-spacing-helper.css";
@import "./assets/css/helper.scss";
@import "../node_modules/flex-layout-attribute/sass/flex-layout-attribute.scss"; // for vuetiful datatable

body, html{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<!-- layout -->
<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction:column;
}
.page-content {
  flex: 1;
  overflow: auto;
}
</style>

<!-- other -->
<style lang="scss">
.logo-wrapper{
  display: block;
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0,0,0,.12);
}
.d2-date-range, .report2-select-wrapper{
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-right: 100px;
}
@media (max-width:960px) {
  .d2-date-range, .report2-select-wrapper{
    justify-content: flex-end;
    padding-right: 0;
  }
}
//
.left-side-bar.md-sidenav.md-theme-blue{
  .md-sidenav-content{
    // display: flex;
    // flex-direction: column;
    background-color: #2196f3;
    .logo-wrapper{
      background-color: #fff;
    }
    .md-list, .md-list-item-container{
      background-color: #2196f3;
    }
    .md-list-item-container{
      color: #fff;
    }
    .md-list-item .md-icon{
      color: #fff;
    }
  }
  // .menu-wrapper{
  // }
}
</style>
