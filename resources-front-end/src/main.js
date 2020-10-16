
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import Vue from 'vue'
window.Vue = Vue
// import 'element-ui/lib/theme-chalk/index.css'
import './theme/index.css'
import 'babel-polyfill'
import ElementUI from 'element-ui'

// import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import App from './App'
import store from './store'

import router from './router'
import '@/icons' // icon
import '@/iconfont/iconfont.css' // iconfont

// import '@/permission' // permission control
/**
 * This project originally used easy-mock to simulate data,
 * but its official service is very unstable,
 * and you can build your own service if you need it.
 * So here I use Mock.js for local emulation,
 * it will intercept your request, so you won't see the request in the network.
 * If you remove `../mock` it will automatically request easy-mock data.
 */

// if (process.env.NODE_ENV === 'development') {
//   require('../mock') // simulation data
// }

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false
Vue.filter('projectTypeFormat', type => {
  return store.getters.projectType[type - 1].label || 'Unknown'
})

import installDirective from '@/directives'
installDirective(Vue)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
