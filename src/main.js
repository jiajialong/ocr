import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import echarts from 'echarts'
import 'element-ui/lib/theme-chalk/index.css';
import { Message, MessageBox, Loading } from 'element-ui'
import VueCookies from 'vue-cookies'
import request from  './plugin/request'


Vue.use(request)
Vue.use(VueCookies)
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$echarts = echarts
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
