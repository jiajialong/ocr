import Vue from 'vue'
import Router from 'vue-router'
// // import Login from './pages/Login'

Vue.use(Router)
let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta:{auth:true,keepAlive: false},
      component: () => import('./pages/Login.vue'),
    },
    {
      path:'/',
      name:'home',
      meta:{auth:true,keepAlive: false},
      component: () => import('./pages/Home.vue')
    }
  ]
})

router.beforeEach((to,from,next)=>{
  let hasLogin =  global.sessionStorage.getItem('hasLogin')
  if(to.name === 'home'){
    if(hasLogin=== 'hasLogin'){
      next()
    }else{
      next('/login')
    }
  }else{
    next()
  }
  // console.log(to)
  // if(to.name != 'Login'){
  //   if(status !=null || from.name === 'Login'){
  //     next();
  //   }else{
  //     Message({
  //       message: "您无访问权限,请先登陆!",
  //       type: "warning"
  //     })
  //     next('/login')
  //     // 您无访问权限,请先登陆!
  //   }
  // }else{
  //   // console.log(to.name)
  //   next()
  // }


})

export default router
