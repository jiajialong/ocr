<template>
  <div class="ocr_login">
    <div class="login_content">
      <div class="login_left"></div>
      <div class="login_right">
        <div class="login_info">
          <input class="login_input username_icon"
                 placeholder="用户名"
                 type="text"
                 v-model="login_username"
          />

          <input class="login_input passward_icon"
                 placeholder="密码"
                 type="password"
                 @keyup="enterLogin"
                 v-model="logon_passward"/>

          <div class="about_passward">
            <div class="remember_passward" @click="changeIsRemember">
              <i class="remember_check remember_icon" v-show="!isRemember"></i>
              <i class="remember_checked remember_icon" v-show="isRemember" ></i>
              <span>记住密码</span>
            </div>
            <div class="forget_passward">
              <span  @click="forget_passward">忘记密码?</span>
            </div>
          </div>
          <div class="login_botton">
            <button @click="ocr_login">登录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'Login',
    data () {
      return {
        login_username: "",
        logon_passward: "",
      }
    },
    computed: {
      ...mapState({
        isRemember: state => state.isRemember
      })
    },

    mounted () {

      //用户名
      this.login_username = this.$cookies.get('username');
      let password = this.$cookies.get('password');
      console.log(password)
      if(password!=null){
        this.logon_passward = password
        this.ocr_login()
      }
    },

    methods: {
      changeIsRemember () {
        this.$store.dispatch('changeIsRemember');
        this.$cookies.set('password', this.logon_passward)
      },

      async ocr_login () {
        let userName = this.login_username;
        let passward = this.logon_passward;
        this.$cookies.set('username', userName)
        if (userName == "" || passward == "") {
            this.$message({
              message: "密码和账号不能为空",
              type: "warning"
            })
        } else {
          try {
            let login = await this.request('/User/login', {account: userName, password: passward})
            // return
            if(login.code === '0000'){
              global.sessionStorage.setItem('hasLogin','hasLogin')
              this.$cookies.set('name', login.data.name)
              this.$router.push({
                path: '/'
              })
            }else{
              this.$message({
                message: login.msg,
                type: "warning"
              })
              this.login_username ="";
              this.logon_passward ="";
            }
          }catch (e) {
            console.error(e)
          }
        }

      },
      enterLogin(e){
        if(e.key ==='Enter'){
          this.ocr_login()
        }
      },
      forget_passward(){
        this.$message({
          message: "请联系管理员",
          type: "warning"
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .ocr_login {
    width: 100%;
    height: 100%;
    background: url("../assets/img/login/bg.jpg") no-repeat center center;
    position: relative;
    overflow: hidden;

    .login_content {
      position: absolute;
      width: 1190px;
      height: 882px;
      left: 0;
      right: 0;
      bottom: -5%;
      margin: auto;
      box-sizing: border-box;
      background: url("../assets/img/login/logo.png") no-repeat center center;
      background-size: 100% 100%;

      .login_left {
        width: 59%;
        height: 100%;
        float: left;
      }

      .login_right {
        float: left;
        height: 100%;
        width: 41%;
        position: relative;

        .login_info {
          width: 100%;
          height: 72%;
          position: absolute;
          bottom: 0;
          text-align: center;

          .login_input {
            width: 335px;
            height: 45px;
            border: none;
            outline: none;
            box-sizing: border-box;
            border-radius: 5px;
            color: #333;
            font-size: 16px;
            text-indent: 50px;
            border: 1px solid #0090ff;
            border-radius: 5px;
            background-position:10px center;
            background-size: 20px;
            background-repeat: no-repeat;

          }

          .username_icon {
            margin-bottom: 44px;
            background-image: url("../assets/img/login/use.png");
          }


          .passward_icon {
            margin-bottom: 28px;
            background-image: url("../assets/img/login/passward.png");
          }

          .about_passward {
            width: 335px;
            height: 45px;
            left: 0;
            right: 0;
            margin: auto;
            margin-bottom: 20px;

            & > div {
              height: 100%;
              line-height: 45px;
              font-size: 14px;
            }

            .remember_passward {
              float: left;
              width: 50%;
              cursor: pointer;

              .remember_icon {
                float: left;
                height: 16px;
                width: 16px;
                cursor: pointer;
                background-repeat: no-repeat;
                background-position: center;
                background-size: 16px;
              }

              .remember_check {
                background-image: url("../assets/img/login/check.png");
              }

              .remember_checked {
                background-image: url("../assets/img/login/checked.png");
              }

              & > span {
                float: left;
                height: 16px;
                line-height: 16px;
                margin-left: 5px;
                font-size: 14px;

              }
            }

            .forget_passward {
              float: right;
              width: 50%;
              line-height: 16px;
              text-align: right;

              span {
                display: inline-block;
                height: 16px;
                line-height: 16px;
                cursor: pointer;
              }
            }
          }

          .login_botton {
            width: 335px;
            height: 45px;
            left: 0;
            right: 0;
            margin: auto;

            button {
              border: none;
              outline: none;
              width: 100%;
              height: 100%;
              color: #fff;
              font-size: 18px;
              background: url("../assets/img/login/login_button.png") no-repeat center center;

              &:active {
                background: url("../assets/img/login/login_botton1.png") no-repeat center center;
              }
            }

          }
        }
      }
    }
  }

  //@media screen and (max-height: 900px) {
   // .login_content {
    //  bottom: -5%;
   // }
 // }

 // @media screen and (min-height: 900px) and (max-height: 1080px) {
  //  .login_content {
  //    bottom: -5%;
  //  }
 // }
</style>
