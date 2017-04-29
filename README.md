# car-tracking

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build


# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
## More About Build
command: npm run build  
config:  
``` js
// config/index.js  
{
  assetsPublicPath: '/' // change it if the project is not under website root
}
// src/config.js
config = {
  isCROS: false, // is the frontend and backend under diffrent domain.
  clientBaseUrl: null, // for vue-router html5 mode, define the base url of frontend
  serverBaseUrl: null, // for axios, define the base url of request to backend
}
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Changes
[17/04/28 15:32] add ./src/components/GoogleMapTrackRender.vue  
[17/04/29 16:13] Left sidebar menu is ok. First, define the menu item text in   dir 'lang', then define menu items in store/menu.js  
[17/04/29 17:25] full screen button: append '<fullscreen-button></fullscreen-button>' to md-card-header -> md-title. example:
```html
<md-card-header>
  <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
</md-card-header>
```
