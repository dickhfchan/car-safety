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

          <md-button class="md-icon-button" @click.native="toggleRightSidenav">
           <md-icon>more_horiz</md-icon>
           <md-tooltip md-direction="left">{{$t('settings')}}</md-tooltip>
          </md-button>


        </md-toolbar>
      </md-whiteframe>

      <md-sidenav md-theme="blue" class="md-left sidebar-layer" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
          <md-toolbar class="md-large">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('brand')}}</h3>
            </div>
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
  </div>
</template>

<script>
import Login from '@/components/Login.vue'
import MapFilters from '@/components/MapFilters.vue'
export default {
  components: { Login, MapFilters },
  data () {
    const state = this.$store.state
    return {
      settings: {
        map: state.map,
        lang: state.lang,
      },
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
    }
  }
}

</script>

<!-- base -->
<style lang="scss">
// the css about svg in vue-material.css will effect baidu map overlays, add svg{max-width: inherit;} to prevent that (already added in baidu-map-track-render-vue )
@import "../node_modules/vue-material/dist/vue-material.css";
// layer.css should after vue-material.css
@import "./assets/css/layer.css";
@import "../node_modules/css-spacing-helper/css-spacing-helper.css";
@import "./assets/css/helper.css";

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
</style>
