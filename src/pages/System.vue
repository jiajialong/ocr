<template>
  <div class="ocr_system">
    <div class="system_mainPage">
      <div class="system_title"><span>系统管理</span></div>
      <div class="system_content">
        <div class="system_add">
          <span class="addNewNode" @click="change_addnewNode('new_version')">+新建版本</span>
          <button class="refresh" @click="refresh_list">刷新</button>

        </div>
        <div class="system_items">
          <div class="th">
            <div class="td first">序号</div>
            <div class="td">应用包名</div>
            <div class="td">应用名称</div>
            <div class="td">版本号</div>
            <div class="td">版本类型</div>
            <div class="td">上传时间</div>
            <div class="td">状态</div>
            <div class="td">更新说明</div>
            <div class="td">操作</div>
          </div>
          <div class="tbody">
            <div class="tr" v-for="(item,index) in System_list" :key="index">
              <div class="td first">{{index+1+pageSize*pageIndex}}</div>
              <div class="td can_click">{{item.appPackageName}}</div>
              <div class="td">{{item.appName}}</div>
              <div class="td">{{item.appVersion}}</div>
              <div class="td">{{item.versionType_labal}}</div>
              <div class="td">{{item.createTime}}</div>
              <div class="td" :class="{being:item.status===1,prohibit:item.status === 2}"></div>
              <div class="td can_click" @click="change_addnewNode('lookOver',item)">查看</div>
              <div class="td">
                <button class="rpohibit" v-show="item.status == 2" @click="release_open(item)">发布</button>
                <button class="sys_close" v-show="item.status == 1" @click="release_close(item)">关闭</button>
                <button class="new_Installation" v-show="item.status == 1"
                        @click="change_addnewNode('refresh_package',item)">更新安装
                </button>
              </div>
            </div>
            <div class="ocr_scrollbar"></div>
          </div>
        </div>
        <div class="system_pageNum">
          <pagination :page-index.sync="pageIndex" :page-size.sync="pageSize" @page="changePage" :total='SystemTotal'
                      @limit="changePageSize"></pagination>
          <!--<pagination :page="pageIndex" :limit="pageSize" @page="changePage" :total='SystemTotal'-->
                      <!--@limit="changePageSize"></pagination>-->
        </div>
      </div>
    </div>
    <!--新建版本-->
    <div class="addNewNode_mark" v-show="isShow_markman=='new_version'">
      <div class="markman_content">
        <div class="markman_title">
          <div class="markman_title_left">新建版本</div>
          <div class="markman_title_right" @click="close_addnewNode('')"></div>
        </div>
        <div class="markman_main">
          <div class="markman_addItem new_package">
            <span>应用包：</span>
            <div class="change_file">
              <div class="change_file_div">选择文件</div>
              <div class="change_file_inner" @click="show"/>
            </div>
            <input class="change_file_value" placeholder="" v-model="file_name.name"/>
          </div>
          <div class="markman_addItem progressBar" v-show="complete">
            <span>上传进度：</span>
            <div class="progressBar_outer">
              <div class="progressBar_inner" :style="{width:progress+'%'}"></div>
            </div>
            <span class="progress">{{progress}}%</span>
          </div>
        </div>
        <div class="add_button">
          <button class="add_cancel" @click="close_addnewNode">取消</button>
          <button class="add_conform" @click="system_release">发布</button>
        </div>
      </div>
    </div>
    <!--查看跟新说明-->
    <div class="addNewNode_mark" v-show="isShow_markman== 'lookOver'">
      <div class="markman_content update_package">
        <div class="markman_title">
          <div class="markman_title_left">更新说明</div>
          <div class="markman_title_right" @click="close_addnewNode"></div>
        </div>
        <div class="markman_main new_package_markman">
          <div class="update_item">
            <div class="update_item_title">
              <div class="Edition">{{lookOver_version}}</div>
              <div class="update_item_time">{{lookOver_time}}</div>
            </div>
            <div class="update_item_msg">{{lookOver_versionDescription}}</div>
          </div>

        </div>
      </div>
    </div>
    <!--跟新安装包-->
    <div class="addNewNode_mark" v-show="isShow_markman== 'refresh_package'">
      <div class="markman_content " :class="isShow_markman">
        <div class="markman_title">
          <div class="markman_title_left">更新安装包</div>
          <div class="markman_title_right" @click="close_addnewNode"></div>
        </div>
        <div class="markman_main new_package_markman">
          <div class="markman_addItem new_package">
            <span>应用包：</span>
            <div class="change_file">
              <div class="change_file_div">选择文件</div>
              <div class="change_file_inner" @click="editshow"/>
            </div>
            <input class="change_file_value" v-model="edit_file.name" placeholder=""/>
          </div>
          <div class="markman_addItem progressBar" v-show="complete">
            <span>更新进度：</span>
            <div class="progressBar_outer">
              <div class="progressBar_inner" :style="{width:progress+'%'}"></div>
            </div>
            <span class="progress">{{progress}}%</span>
          </div>
          <div class="add_button">
            <button class="add_cancel" @click="close_addnewNode">取消</button>
            <button class="add_conform" @click="edit_pacage">更新</button>
          </div>
        </div>
      </div>
    </div>
    <!--刷新-->
    <div class="system_refresh" v-show="refresh_status">
      <div class="refresh_div"></div>
    </div>
  </div>
</template>

<script>
  import pagination from '../components/page'
  import moment from 'moment'
  // import Vtextarea from '../components/textarea'

  export default {
    name: "Colony",
    data () {
      return {
        options: [],
        apply_Name: "",
        isShow_markman: "",
        node_checked: true,
        refresh_status: false,
        file_name: "",
        pageIndex: 0,
        System_list: [],
        SystemTotal: 0,
        progress: "",
        lookOver_version: "",
        lookOver_time: "",
        complete: false,
        lookOver_versionDescription: "",
        UpdateInstructions: '',
        pageSize: 10,
        edit_file: "",
        edit_id: '',
        // VersionType: '1'
      }
    },
    components: {
      pagination,
      // Vtextarea
    },
    mounted () {
      this.SystemList()
    },
    methods: {
      //刷新列表
      refresh_list () {
        this.refresh_status = true;
        this.SystemList()
      },
      change_addnewNode (status, value) {
        this.isShow_markman = status
        if (status === 'lookOver') {
          this.lookOver_version = value.appVersion
          this.lookOver_time = value.createTime
          this.lookOver_versionDescription = value.versionDescription
        }
        if (status == 'refresh_package') {
          this.edit_id = value.id
        }
      },
      close_addnewNode () {
        this.apply_Name = "";
        this.file_name = "";
        this.complete = false;
        this.edit_file = "";
        this.isShow_markman = ''
      },
      async release_open (value) {
        let openObj = {}
        openObj.id = value.id;
        openObj.status = 1;
        let result = await this.request('/SystemConfig/open', openObj);
        if (result.code === '0000') {
          this.SystemList()
        }
      },
      //release_close
      async release_close (value) {
        let closeObj = {}
        closeObj.id = value.id;
        closeObj.status = 2;
        let result = await this.request('/SystemConfig/close', closeObj);
        if (result.code === '0000') {
          this.SystemList()
        }
      },
      checked_change () {
        this.node_checked = !this.node_checked
      },
      show () {
        let input = document.createElement('input')
        input.type = 'file'
        input.multiple = false
        input.accept = 'application/x-zip-compressed'
        input.onchange = e => {
          this.file_name = e.target.files[0];
        }
        input.click()
      },
      editshow () {
        let input = document.createElement('input')
        input.type = 'file'
        input.multiple = false
        input.accept = 'application/x-zip-compressed'
        input.onchange = e => {
          this.edit_file = e.target.files[0];
        }
        input.click()
        // this.$refs.pathClearEdit.value =''
      },
      //获取list
      async SystemList () {
        let SystemObj = {};
        SystemObj.pageNum = this.pageIndex + 1;
        SystemObj.pageSize = this.pageSize;
        let SystemData = await this.request('/SystemConfig/querySystemConfigList', SystemObj);
        if (SystemData.data.list != null) {
          SystemData.data.list.forEach((ele) => {
            ele.createTime = moment(ele.createTime).format('YYYY-MM-DD HH:mm:ss')
            if (ele.versionType === 1) {
              ele.versionType_labal = 'windows'
            } else if (ele.versionType === 2) {
              ele.versionType_labal = 'Kylin_deb'
            } else if (ele.versionType === 3) {
              ele.versionType_labal = 'linux'
            }
          })
        }
        this.System_list = SystemData.data.list
        this.SystemTotal = SystemData.data.total
        this.refresh_status = false;
      },
      //翻页
      changePage (e) {
        this.pageIndex = e;
        this.SystemList()
      },
      changePageSize (e) {
        this.pageIndex = 0
        this.pageSize = e;
        this.SystemList()
      },
      async system_release () {
        let systemObj = {}
        systemObj.appFile = this.file_name;
        console.log('systemObj:', systemObj)
        let systemfile = new FormData()
        for (let name in systemObj) {
          systemfile.append(name, systemObj[name])
        }
        if (!this.complete) {
          let result = await this.request('/SystemConfig/addSystemConfig', systemfile, {
            onUploadProgress: (progress) => {
              this.complete = true
              this.progress = Math.round(progress.loaded / progress.total * 100);
              // if(this.progress == 100) this.complete = false
            }
          });
          if (result.code == '0000') {
            this.SystemList()
            this.close_addnewNode()
            this.isShow_markman = ''
            this.$message({
              message: "发布成功!",
              type: "success"
            })
            this.pageIndex = 0;
          }
        } else {
          this.$message({
            message: "正在上传,请勿重复操作!",
            type: "warning"
          })
        }
      },
      async edit_pacage () {
        let editObj = {};
        editObj.id = this.edit_id
        editObj.appFile = this.edit_file
        let editsystemfile = new FormData()
        for (let name in editObj) {
          editsystemfile.append(name, editObj[name])
        }
        if (!this.complete) {
          let result = await this.request('/SystemConfig/editSystemConfig', editsystemfile, {
            onUploadProgress: (progress) => {
              this.complete = true
              this.progress = Math.round(progress.loaded / progress.total * 100);
              // if(this.progress == 100) this.complete = false
            }
          });
          if (result.code == '0000') {
            this.SystemList()
            this.close_addnewNode()
            this.isShow_markman = ''
            this.$message({
              message: "更新成功",
              type: "success"
            })
          }
        } else {
          this.$message({
            message: "正在更新上传,请勿重复操作!",
            type: "warning"
          })
        }

      },
    }
  }
</script>
<style lang="scss">
  .ocr_system {
    .el-select-dropdown.el-popper {
      margin-top: -5px;
    }

    .el-input--suffix {
      .el-input__inner {
        display: inline-block;
        vertical-align: top;
        border: 1px solid #ccc;
      }
    }

    .el-select {
      .el-input {
        .el-select__caret {
          position: absolute;
          right: 0;
          top: 0;
          height: 40px;
        }
      }
    }

    .el-icon-arrow-up:before {
      content: "";
      height: 30px;
      width: 30px;
      display: inline-block;
      background-repeat: no-repeat;
      background-position: center center;
      background-image: url("../assets/img/statistics/xiala.png");
    }
  }

</style>
<style scoped lang="scss">
  .ocr_system {
    width: 100%;
    height: 100%;

    .system_mainPage {
      width: 100%;
      height: 100%;

      .system_title {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #d0e7fa;
        box-sizing: border-box;
        padding: 0 12px;

        span {
          padding: 0 15px;
          display: inline-block;
          vertical-align: top;
          height: 41px;
          box-sizing: border-box;
          border-bottom: 3px solid #4173d2;
          color: #333;
          font-size: 18px;
        }
      }

      .system_content {
        width: 100%;
        height: calc(100% - 41px);

        .system_add {
          width: 100%;
          height: 60px;
          box-sizing: border-box;
          padding: 0 12px;
          cursor: pointer;
          position: relative;

          .refresh {
            outline: none;
            width: 68px;
            height: 32px;
            padding: 0;
            box-sizing: border-box;
            text-indent: 25px;
            background-repeat: no-repeat;
            background-color: #fff;
            margin-right: 5px;
            text-align: left;
            background-position: 5px center;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 14px;
            position: absolute;
            right: 10px;
            top: 14px;
            background-size: 16px;
            background-image: url("../assets/img/home/sx.png");
          }

          .addNewNode {
            display: inline-block;
            width: 78px;
            height: 30px;
            text-align: center;
            line-height: 30px;
            /*background-color: #f5822b;*/
            color: #0066dc;
            border-radius: 5px;
            border: 1px solid #0066dc;
            font-size: 14px;
            margin-top: 14px;
          }
        }

        .system_items {
          height: calc(100% - 140px);
          width: 100%;
          background: #fff;
          box-sizing: border-box;
          padding: 0 12px;

          .tbody {
            height: calc(100% - 30px);
            overflow-y: auto;
            background-color: #fff;
            position: relative;

            &::-webkit-scrollbar {
              position: absolute;
              right: 0;
              top: 0;
              width: 6px;
              height: 6px;
              background-color: #ededed;
            }

            &::-webkit-scrollbar-track {
              border-radius: 6px;
              background-color: #ededed;
            }

            /* 滚动条中能上下移动的小块 */
            &::-webkit-scrollbar-thumb {
              border-radius: 6px;
              background-color: #ccc;
            }

          }

          .th {
            height: 48px;
            background-color: #ededed;

            .td {
              height: 30px;
              margin-top: 10px;
              line-height: 30px;
              border-right: 1px solid #dcddde;
              font-size: 14px;
              color: #333;
              font-weight: bold;
              display: inline-block;
              /*text-align: center;*/
              box-sizing: border-box;

              &:nth-child(1) {
                text-align: center;
              }

              &:not(.first) {
                padding-left: 25px;
              }


              $arr: (80px, 220px, calc((100% - 900px) / 4), calc((100% - 900px) / 4), 140px, 220px, calc((100% - 900px) / 4), calc((100% - 900px) / 4), 240px);

              @for $i from 1 through length($arr) {
                &:nth-child(#{$i}) {
                  width: nth($arr, $i);
                }
              }
            }

          }

          .tr {
            height: 75px;
            border-bottom: 1px solid #e2e2e2;

            &:nth-child(2n) {
              background-color: #f7f7f7;
            }

            .can_click {
              color: #0066dc;
              cursor: pointer;
            }

            .td {
              display: inline-block;
              /*text-align: center;*/
              line-height: 75px;
              box-sizing: border-box;
              font-size: 14px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;

              &:nth-child(1) {
                text-align: center;
              }

              &:not(.first) {
                padding-left: 25px;
              }

              &:nth-child(7) {
                &.being::after {
                  content: "发布";
                  display: inline-block;
                  color: #019f2e;
                  height: 100%;
                }

                &.prohibit::after {
                  content: "未发布";
                  display: inline-block;
                  color: #db2703;
                  height: 100%;
                  width: 60px;
                }

              }

              &:nth-child(9) {
                cursor: pointer;
                display: inline-block;
                vertical-align: center;

                button {
                  border: none;
                  outline: none;
                  background-color: #fff;
                  border-radius: 5px;
                  width: 80px;
                  height: 30px;
                  /*color: #fff;*/
                }

                .sys_close, .rpohibit {
                  display: inline-block;
                  height: 30px;
                  line-height: 30px;
                  margin-right: 10px;
                  border: 1px solid #ccc;
                  background-position: 10px center;
                  background-repeat: no-repeat;
                  text-indent: 20px;
                  font-size: 14px;
                  background-size: 16px;
                  background-image: url("../assets/img/system/gb.png");
                  /*background-color: #db2703;*/
                  &:hover {
                    color: #fff;
                    background-image: url("../assets/img/system/gb-.png");
                    background-color: #fd5e39;
                  }
                }

                .rpohibit {
                  background-image: url("../assets/img/home/kq.png");

                  &:hover {
                    background-image: url("../assets/img/home/kq-.png");
                  }
                }

                .new_Installation {
                  display: inline-block;
                  height: 30px;
                  border: 1px solid #ccc;
                  background-position: 10px center;
                  background-repeat: no-repeat;
                  text-indent: 20px;
                  width: 105px;
                  font-size: 14px;
                  background-size: 16px;
                  background-image: url("../assets/img/system/gx.png");

                  &:hover {
                    color: #fff;
                    background-color: #0066dc;
                    background-image: url("../assets/img/system/gx-.png");
                  }

                  /*background-color: #0066dc;*/
                }

              }

              $arr: (80px, 220px, calc((100% - 900px) / 4), calc((100% - 900px) / 4), 140px, 220px, calc((100% - 900px) / 4), calc((100% - 900px) / 4), 240px);

              @for $i from 1 through length($arr) {
                &:nth-child(#{$i}) {
                  width: nth($arr, $i);
                }
              }
            }

            .tool_button {
              & > button {
                border: none;
                outline: none;
                width: 68px;
                height: 32px;
                padding: 0;
                box-sizing: border-box;
                text-indent: 30px;
                background-repeat: no-repeat;
                background-color: #fff;
                margin-right: 5px;
                text-align: left;
                background-position: 5px center;
                border-radius: 5px;
                border: 1px solid #ccc;
                font-size: 14px;
              }

              .rpohibit {
                background-image: url("../assets/img/home/jy.png");
              }

              .open {
                background-image: url("../assets/img/home/kq.png");
              }

              .edit {
                display: none;
                background-image: url("../assets/img/home/bj.png");

                &:hover {
                  color: #fff;
                  background-color: #1579e3;
                  background-image: url("../assets/img/home/bj-.png");
                }
              }

              .delete {
                background-image: url("../assets/img/home/sc.png");

                &:hover {
                  color: #fff;
                  background-color: #fd5e39;
                  background-image: url("../assets/img/home/sc-.png");
                }
              }

              .refresh {
                display: none;
                background-image: url("../assets/img/home/sx.png");
              }
            }
          }
        }

        .system_pageNum {
          height: 80px;
          width: 100%;
          position: relative;

        }
      }
    }

    .addNewNode_mark {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, .3);

      .markman_content {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        width: 600px;
        height: 200px;
        background-color: #fff;

        .markman_title {
          height: 40px;
          width: 100%;
          background-color: #eaeaea;
          box-sizing: border-box;
          padding: 0 10px;
          line-height: 40px;
          position: relative;

          .markman_title_left {
            color: #333;
            font-size: 16px;
            height: 100%;
          }

          .markman_title_right {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 40px;
            cursor: pointer;
            background-repeat: no-repeat;
            background-position: center center;
            background-image: url("../assets/img/markman/close.png");
          }
        }

        .add_button {
          width: 100%;
          box-sizing: border-box;
          padding: 0 20px;
          height: 50px;
          position: absolute;
          bottom: 0;
          text-align: right;

          & > button {
            width: 80px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            border: none;
            border-radius: 2px;
            outline: none;
            font-size: 16px;
            margin-left: 15px;
          }

          .add_cancel {
            color: #333;
            background-color: #fff;
            border: 1px solid #ccc;
          }

          .add_conform {
            color: #fff;
            background-color: #1579e3;
          }
        }

        .markman_main {
          width: 100%;
          height: calc(100% - 90px);
          overflow-y: auto;

          &::-webkit-scrollbar {
            position: absolute;
            right: 0;
            top: 0;
            width: 6px;
            height: 6px;
            background-color: #ededed;
          }

          &::-webkit-scrollbar-track {
            border-radius: 6px;
            background-color: #ededed;
          }

          /* 滚动条中能上下移动的小块 */
          &::-webkit-scrollbar-thumb {
            border-radius: 6px;
            background-color: #ccc;
          }

          .markman_addItem {
            width: 100%;
            height: 60px;
            line-height: 60px;
            color: #333;
            font-size: 14px;
            margin: 5px 0;
            box-sizing: border-box;
            padding: 0 10px;

            &.progressBar {
              height: 30px;
              position: relative;

              & > span {
                display: unset;
                height: 30px;
                line-height: 30px;
                margin-left: 5px;
              }

              .progress {
                position: absolute;
                right: 12px;
                top: -1px;
              }

              .progressBar_outer {
                display: inline-block;
                vertical-align: top;
                height: 16px;
                border: 1px solid #ccc;
                border-radius: 15px;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                padding: 0px 0px;
                position: relative;
                margin-top: 6px;
                width: calc(100% - 130px);

                .progressBar_inner {
                  position: absolute;
                  top: 0;
                  height: 16px;
                  background-color: #1f78e2;
                  border-radius: 15px;
                }
              }
            }

            & > span {
              display: inline-block;
              vertical-align: top;
              text-align: right;
              color: #333;
              width: 80px;
              font-size: 14px;
            }

            input, .authorize_status_value {
              display: inline-block;
              vertical-align: top;
              height: 40px;
              border: 1px solid #ccc;
              outline: none;
              color: #999;
              margin-top: 10px;
              border-radius: 5px;
              box-sizing: border-box;
              padding: 0 10px;
              width: calc(100% - 120px);
            }

            .authorize_status_value {
              border: none;
              padding: unset;
            }

            .input_textarea {
              display: inline-block;
              vertical-align: top;
              width: calc(100% - 120px);
              border-radius: 5px;
              line-height: 16px;
              min-height: 80px;
              margin-top: 10px;
            }

            .change_file {
              display: inline-block;
              vertical-align: top;
              width: 84px;
              height: 60px;
              border: none;
              position: relative;
              margin-right: 5px;


              .change_file_div {
                width: 100%;
                height: 38px;
                text-align: center;
                line-height: 38px;
                margin-top: 10px;
                position: absolute;
                top: 0;
                left: 0;
                border: 1px solid #ccc;
                border-radius: 5px;
                cursor: pointer;
                background-color: #f1f1f1;
              }

              .change_file_inner {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 40px;
                opacity: 0;
                z-index: 99;
              }
            }

            .change_file_value {
              width: calc(100% - 210px);
              height: 40px;
              line-height: 30px;
              color: #1f78e2;
            }
          }

        }

        .new_package_markman {
          height: calc(100% - 40px);
        }
      }

      .lookOver {
        height: 100px;
        width: 600px;
      }

      .refresh_package {
        /*height: 360px;*/
      }

      .update_package {
        width: 400px;
        height: 200px;
        background-color: #fff;

        .update_item {
          width: 100%;
          min-height: 160px;
          font-size: 16px;

          .update_item_title {
            height: 40px;
            width: 100%;
            line-height: 40px;
            position: relative;
            padding: 0 10px;
            box-sizing: border-box;
            border-bottom: 1px solid #ccc;

            .Edition {
              height: 100%;
              color: #393939;
              font-weight: bold;
            }

            .update_item_time {
              height: 100%;
              position: absolute;
              right: 10px;
              top: 0;
              width: 220px;
              color: #a4a4a4;
              text-align: right;
              /*font-size: 16px;*/
              /*background-color:rebeccapurple;*/
            }

            .update_item_msg {
              width: 100%;
              height: calc(100% - 10px);
            }
          }

          .update_item_msg {
            height: calc(100% - 40px);
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            font-size: 14px;
          }
        }
      }
    }

    .system_refresh {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, .3);

      .refresh_div {
        width: 120px;
        height: 120px;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('../assets/img/home/loading.png');
        background-size: 30% 30%;
        animation: rotates 3s linear infinite;
      }

      @keyframes rotates {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }

  }
</style>
