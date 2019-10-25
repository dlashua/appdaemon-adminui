import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App.vue'
import AD from './AD.js'
import vuetify from './plugins/vuetify'
import TreeView from "vue-json-tree-view"
import JsonTree from 'vue-json-tree'
import VueVirtualScroller from 'vue-virtual-scroller'

// Load Vue Bootstrap
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
Vue.prototype.$AD = new AD()
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Vue.prototype.$AD.connect('192.168.0.2', 5050, 'ADCP Client')

Vue.use(require('vue-moment'));

Vue.use(TreeView)
Vue.component('json-tree', JsonTree)

Vue.use(VueVirtualScroller)

import ViewApps from './components/ViewApps'
import ViewEntities from './components/ViewEntities'
import ViewThreads from './components/ViewThreads'
import ViewCallbacks from './components/ViewCallbacks'
import ViewTest from './components/ViewTest'

import ViewEntitiesVtf from './components/ViewEntitiesVtf'


Vue.use(VueRouter)

const routes = [
  { path: '/apps', component: ViewApps },
  { path: '/entities', component: ViewEntities },
  { path: '/entities2', component: ViewEntitiesVtf },
  { path: '/threads', component: ViewThreads },
  { path: '/callbacks', component: ViewCallbacks },
  { path: '/test/', component: ViewTest },
  { path: '*', redirect: '/apps' },

]

const router = new VueRouter({
  routes
})


new Vue({
  render: h => h(App),
  router,
  vuetify,
  created: function () {
  }
}).$mount('#app')


// var entity_added_cb = function(change_type, data) {
//   console.log(change_type, data)
// }

// vm.$AD.onEntityChange("admin", /.*/, entity_added_cb)





