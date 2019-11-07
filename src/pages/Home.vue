<template>
  <div class="ocr_home">
    <div class="home_top">
      <div class="top_left">
        {{unit_name}}
      </div>
      <div class="top_right">
        <div class="home_welcom"><i class="home-user"></i><span>欢迎您，{{login_username}}</span></div>
        <div class="home_exit" @click="ocr_exit"></div>
      </div>
    </div>
    <div class="home_bottom">
      <div class="home_nav">
        <div class="home_item" v-for="(item,index) in ocr_homeNav"
             :key="index" :class="{navItem_cheched:navItem_cheched==index}" @click="changeNave(index,item)"><span
          :class="item.classname">{{item.name}}</span>
        </div>
      </div>
      <div class="home_outer">
        <div class="home_inner">
          <Colony v-show="show_page == 'home'"></Colony>
          <Task v-if="show_page == 'task'"></Task>
          <Authorize v-if="show_page == 'authorize'"></Authorize>
          <Statistics v-if="show_page == 'statistics'"></Statistics>
          <System v-if="show_page == 'system'"></System>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import Colony from './Colony'
  import Task from './Task'
  import Statistics from './Statistics'
  import Authorize from './Authorize'
  import System from './System'

  export default {
    name: 'home',
    data () {
      return {
        navItem_cheched: '',
        show_page: 'home',
        login_username: "",
        unit_name: "",
        ocr_homeNav: [
          {
            name: "集群管理",
            classname: 'home'
          }, {
            name: "任务管理",
            classname: "task"
          }, {
            name: '授权管理',
            classname: "authorize"
          }, {
            name: '统计',
            classname: 'statistics'
          }, {
            name: '系统管理',
            classname: 'system'
          }
        ]
      }
    },
    components: {
      Colony,
      Task,
      Statistics,
      Authorize,
      System
    },
    mounted () {
      this.login_username = this.$cookies.get('username');
      this.unit_name = this.$cookies.get('name');
    },
    methods: {
      ocr_exit () {
        this.$cookies.remove('password');
        global.sessionStorage.removeItem('hasLogin');
        this.$store.dispatch('changeIsRemember', {value: false});
        // this.$store.commit('changePassward', '');
        this.$router.push({
          path: "/login"
        })
      },
      changeNave (status, item) {
        this.navItem_cheched = status;
        this.show_page = item.classname
      }
    }
  }
</script>
<style scoped lang="scss">
  .ocr_home {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .home_top {
      width: 100%;
      height: 62px;
      background: #122539;
      position: relative;

      .top_left {
        height: 100%;
        text-indent: 295px;
        background-repeat: no-repeat;
        background-position: 20px center;
        background-image: url('../assets/img/home/logo.png');
        background-size: 274px 45px;
        color: #fff;
        font-size: 22px;
        line-height: 60px;
      }

      .top_right {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;

        .home_welcom {
          height: 100%;
          display: inline-block;
          padding: 0 10px;

          i {
            display: inline-block;
            left: 0;
            width: 50px;
            height: 62px;
            background-position: center center;
            background-repeat: no-repeat;
            background-size: 25px;
            background-image: url("../assets/img/home/user.png");
          }

          span {
            display: inline-block;
            vertical-align: top;
            color: #fff;
            line-height: 62px;
            font-size: 14px;
          }
        }

        .home_exit {
          display: inline-block;
          width: 62px;
          height: 62px;
          background-position: center center;
          background-repeat: no-repeat;
          background-size: 25px;
          background-image: url("../assets/img/home/close.png");
        }
      }
    }

    .home_bottom {
      width: 100%;
      height: calc(100% - 62px);

      .home_nav {
        display: inline-block;
        width: 195px;
        height: 100%;
        overflow: hidden;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-image: url("../assets/img/home/bg.png");
        vertical-align: top;
        cursor: pointer;

        .home_item:nth-child(1) {
          margin-top: 12px;
        }

        .home_item {
          width: 100%;
          height: 65px;
          display: block;
          text-decoration: none;
          line-height: 65px;
          color: #fff;
          box-sizing: border-box;
          font-size: 18px;

          span {
            display: inline-block;
            height: 65px;
            width: 100%;
            vertical-align: top;
            text-indent: 50px;
            line-height: 65px;
            background-repeat: no-repeat;
            background-position: 20px center;
            background-size: 20px;
            $arr: (home, task, authorize, statistics, system);
            @for $i from 1 through length($arr) {
              $item: nth($arr, $i);
              &.#{$item} {
                background-image: url("../assets/img/home/#{$item}.png");
              }
            }
          }

        }

        .navItem_cheched {
          border-left: 4px solid #06c83e;
          background-color: #0958af;

          span {
            text-indent: 46px;
            background-position: 16px center;
          }
        }

      }

      .home_outer {
        display: inline-block;
        width: calc(100% - 195px);
        height: 100%;
        box-sizing: border-box;
        padding: 12px;
        background-color: #ebebeb;
        position: relative;

        .home_inner {
          width: 100%;
          height: 100%;
          background-color: #fff;
        }
      }
    }
  }

</style>
