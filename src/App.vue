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

          <MapFilters v-if="$route.name === 'map'"></MapFilters>
          <span v-else class="flex-1"></span>

          <md-button class="md-icon-button" @click.native="toggleRightSidenav">
           <md-icon>apps</md-icon>
           <md-tooltip md-direction="bottom">unknow</md-tooltip>
          </md-button>

          <md-button class="md-icon-button" @click.native="toggleRightSidenav">
           <md-icon>notifications</md-icon>
           <md-tooltip md-direction="bottom">Notifications</md-tooltip>
          </md-button>

          <md-button class="md-icon-button" @click.native="toggleRightSidenav">
           <md-icon>settings</md-icon>
           <md-tooltip md-direction="bottom">{{$t('settings')}}</md-tooltip>
          </md-button>

          <md-avatar>
            <img src="./assets/img/avatar.png" alt="Avatar">
          </md-avatar>

        </md-toolbar>
      </md-whiteframe>

      <md-sidenav md-theme="blue" class="md-left sidebar-layer" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
          <md-toolbar class="md-large logo-wrapper" md-theme="white">
            <router-link :to="{name: 'dashboard'}">
              <img src="./assets/img/webwxgetmsgimgg.jpg" alt="Vue">
            </router-link>
          </md-toolbar>

          <md-list>
            <md-list-item v-for="(item, index) in $store.state.menu"
            :key="index"
            :href="$router.resolve({name:item.routeName}).href"
            @click.native.prevent="$router.push({name:item.routeName})"
            >
              <md-icon>{{item.icon}}</md-icon> <span>{{$t(item.text)}}</span>
            </md-list-item>
          </md-list>

      </md-sidenav>

      <md-sidenav md-theme="blue" class="md-right sidebar-layer" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
          <md-toolbar class="">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('settings')}}</h3>
            </div>
          </md-toolbar>

          <form novalidate @submit.stop.prevent="updateSettings">
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
    <md-dialog-alert :md-content="alert.content" md-ok-text="OK" ref="alert"></md-dialog-alert>
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
// import Confirm from '@/components/Confirm.vue'

export default {
  components: { Login, MapFilters },
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
        ok: 'OK',
        cancel: 'Cancel',
        resolve: null,
        reject: null,
      }
    }
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
    updateSettings() {
      this.$store.commit('map', this.settings.map)
      this.$store.commit('lang', this.settings.lang)
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
        this.confirm.title = 'Confirm'
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
</style>
