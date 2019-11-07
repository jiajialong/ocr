import axios from 'axios'
import router from '../router'
import store from '../store'
import vue from 'vue'


// 添加响应拦截器
axios.interceptors.response.use(async function (response) {
  // console.log(response.data)
  // 对响应数据做点什么
  if (response.data.code) {
    if (response.data.code === '2010') {
      await vue.prototype.$message({
        message: "您无访问权限,请先登陆!",
        type: "warning"
      })
      await vue.prototype.$cookies.remove('password');
      await store.dispatch('changeIsRemember', {value: false});
      // store.commit('changePassward', '');
      router.push({
        path: "/login"
      })
    } else {
      return response.data;
    }
  } else {
    Promise.reject(new Error(response.data.msg))
  }
  // return response.data;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});
function request (url, data, option = {}) {
  let config = {
    // baseURL: 'http://192.168.2.104:8090',
    baseURL: `http://${window.serverip}:${window.port}`,
    // baseURL: 'http://192.168.2.42:8090',
    // baseURL: 'http://192.168.2.42:8090',
    url: url,
    method: 'post', // default
    headers: {'content-type': 'application/json;charset=UTF-8'},
    // headers: {'X-Requested-With': 'XMLHttpRequest'},
    // params: {
    //   ID: 12345
    // },
    // paramsSerializer: function(params) {
    //   return Qs.stringify(params, {arrayFormat: 'brackets'})
    // }, //param参数处理
    // data: {
    //   firstName: 'Fred'
    // },
    // timeout: 1000,
    // `withCredentials` 表示跨域请求时是否需要使用凭证
    // onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
    // },
    withCredentials: true, // default
    // `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    responseType: 'json', // default
    ...option
  }
  if (/post/i.test(config.method)) {
    config.data = data
  } else if (/get/i.test(config.method)) {
    config.params = data
  }
  return axios.request(config)
}

export default Vue => {
  Vue.prototype.request = request
}
