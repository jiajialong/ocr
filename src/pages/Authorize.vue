<template>
  <div class="ocr_authorize">
    <div class="authorize_mainPage">
      <div class="authorize_title">
        <span>授权管理</span>
      </div>

      <div class="authorize_content">
        <div class="statistics_search">
          <div class="ip_address"><input class="ip_value" placeholder="请输入名称" v-model="org_type_name"/></div>
          <!--<div class="ip_address"><input @blur="nodeIp_reg" class="ip_value" placeholder="IP地址" v-model="ip_address"/>-->
          <!--</div>-->
          <div class="submission_time">
            <span>提交时间：</span>
            <el-date-picker
              v-model="startData"
              class="date-time"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              :picker-options="pickerOptionsStart"
              placeholder="开始时间"></el-date-picker>
          </div>
          <div class="authorize_status ">
            <span>授权状态：</span>
            <el-select class="authorize_status_value" v-model="authorize_status" placeholder="请选择">
              <el-option
                v-for="item in authorize_status_options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="search_buttons">
            <button class="search_query" @click="queryAuthorize">查询</button>
            <button class="search_empty" @click="clearQuery">清空条件</button>
            <button class="authorize_add" @click="close_addnewNode(true)">+新增</button>
          </div>
        </div>
        <div class="authorize_items">
          <div class="th">
            <div class="td first">序号</div>
            <div class="td">名称</div>
            <div class="td">IP地址段</div>
            <div class="td">运行状态</div>
            <div class="td">操作</div>
          </div>
          <div class="tbody">
            <div class="tr" v-for="(item,index) in authorize_list" :key="index">
              <div class="td first">{{index+1+pageSize*pageIndex}}</div>
              <div class="td">{{item.orgName}}{{item.edit}}</div>
              <div class="td">
                <div v-show="item.more_edit" class="tdData_two">
                  <span v-if="item.ipList[0]">{{item.ipList[0].ipAddressStart}}-{{item.ipList[0].ipAddressEnd}}</span>
                  <span v-if="item.ipList[1]">{{item.ipList[1].ipAddressStart}}-{{item.ipList[1].ipAddressEnd}}</span>
                </div>
                <div v-if="item.ipList.length>2 && !item.more_edit" class="tdData_more" ref="tdData_more">
                  <span v-for="(itm,idx) in item.ipList" :key="idx">{{itm.ipAddressStart}}-{{itm.ipAddressEnd}}</span>
                </div>
                <span v-if="item.ipList.length>2" class="td_more" @click="click_more(item)">更多</span>
              </div>

              <div class="td status"
                   :class="{being:item.status===1,prohibit:item.status === 2,failed:item.status === 3}"></div>
              <div class="td operation">
                <button class="rpohibit" v-show="item.status == 1" @click="openAuthorizeColony(item)">禁用</button>
                <button class="edit"
                        v-show=" item.status == 2 || item.status == 3"
                        @click="change_addnewNode(item)">编辑
                </button>
                <button class="open" v-show="item.status == 2" @click="closeAuthorizeColony(item)">开启</button>
                <!--<button class="refresh" v-show="item.status == 3">刷新</button>-->
                <button class="delete"
                        v-show=" item.status == 2 || item.status == 3"
                        @click="delete_node(item)">删除
                </button>
              </div>
            </div>
            <div class="ocr_scrollbar"></div>
          </div>
        </div>
        <div class="authorize_pageNum">
          <pagination :page-index.sync="pageIndex" :page-size.sync="pageSize" @page="changePage" :total='aothorizeTotal'
                      @limit="changePageSize"></pagination>
          <!--<pagination :page="pageIndex" :limit="pageSize" @page="changePage" :total='aothorizeTotal'-->
                      <!--@limit="changePageSize"></pagination>-->
        </div>
      </div>
    </div>
    <div class="addNewNode_mark" v-show="isShow_markman">
      <div class="markman_content">
        <div class="markman_title">
          <div class="markman_title_left" v-if="!edit">新增授权</div>
          <div class="markman_title_left" v-if="edit">修改授权</div>
          <div class="markman_title_right" @click="close_addnewNode(false)"></div>
        </div>
        <div class="markman_main">
          <div class="markman_addItem markman_addItem_name">
            <span class="ipAddressSegment">名称：</span><input v-model="authorizeName" placeholder="请输入名称"/>
          </div>
          <div class="markman_addItem markman_addItem_name mark_authorize_status">
            <span class="ipAddressSegment">授权类型：</span>
            <el-select class="authorize_status_value" v-model="authorizeType">
              <el-option
                v-for="item in org_type_options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="ipAddressSegmentItems">
            <div class="markman_addItem ipAddressSegmentItem" v-for="(item,index) in ipAddressSegment" :key="index">
              <span class="ipAddressSegment">IP地址段：</span>
              <ip-adress v-model="ipAddressSegment[index]"></ip-adress>
              <div class="ipAddress_delete" v-show="index===ipAddressSegment.length-1 && index!=0"
                   @click="ipAddress_delete(index)"></div>
            </div>
          </div>
          <p class="addAddresssegment" @click="addIpAddressSegment">+添加地址段</p>
          <div class="addItem_radio">
            <div class="radio-box">
              <span class="radio" :class="{'on':radio ===1}"></span>
              <input v-model="radio" :value="radio" class="input-radio" @click="check(1)" type="radio">开启
            </div>
            <div class="radio-box">
              <span class="radio" :class="{'on':radio === 2}"></span>
              <input v-model="radio" :value="radio" class="input-radio" @click="check(2)" type="radio">关闭
            </div>
          </div>

        </div>
        <div class="add_button">
          <button class="add_cancel" @click="close_addnewNode(false)">取消</button>
          <button class="add_conform new" v-if="!edit" @click="store_ip">保存</button>
          <button class="add_conform edit" v-if="edit" @click="editStore_ip">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import pagination from '../components/page';
  import IpAdress from '../components/ipAdress';
  import {mapState} from 'vuex';

  export default {
    name: "Colony",
    data () {
      return {
        isShow_markman: false,
        pageIndex: 0,
        pageSize: 10,
        authorizeName: "",
        authorizeType: '2',
        companyName: "",
        aothorizeTotal: 0,
        editid: "",
        edit: true,
        ipAddressSegment: [
          {
            ipAdress1: ['', '', '', ''],
            ipAdress2: ['', '', '', ''],
          }
        ],
        status: [false],
        node_checked: true,
        startData: "",
        radio: 1,
        ip_address: "",
        authorize_status_options: [{value: 1, label: '正常'}, {value: 2, label: '禁用'}, {value: 3, label: '其他'}],
        org_type_options: [{value: '1', label: '单位'}, {value: '2', label: '系统'}],
        authorize_status: '',//默认
        org_type_name: '',//默认单位
        authorize_list: [],
        ocr_th: ["序号", "名称", "IP地址段", "运行状态", "操作"],
        pickerOptionsStart: {
          disabledDate: (time) => {
            return time.getTime() > new Date().getTime();
          }
        },
      }
    },
    computed: {
      ...mapState({
        ocr_td: state => state.ocr_td
      }),
      ocr_td_list () {
        let startIndex = 0
        startIndex = this.pageIndex * this.pageSize
        let endIndex = 0
        endIndex = (this.pageIndex + 1) * this.pageSize - 1
        return this.ocr_td.filter((item, index) => startIndex <= index && index <= endIndex)
      }
    },
    mounted () {
      this.change_style()
      this.queryAuthorizationList()
    },
    components: {
      pagination,
      IpAdress
    },
    methods: {
      change_style(){
        let line = document.querySelector('.el-range-separator');
        line.innerHTML = "~"
      },
      change_addnewNode (status) {
        this.edit = true;
        this.editid = status.id
        this.isShow_markman = true;
        this.ipAddressSegment = [];
        this.authorizeName = status.orgName;
        this.authorizeType = status.orgType;
        this.radio = status.status
        console.log(status)
        let ipAdressObj = {}
        let list = status.ipList;
        list.forEach((ele) => {
          ipAdressObj.ipAdress1 = ele.ipAddressStart.split('.')
          ipAdressObj.ipAdress2 = ele.ipAddressEnd.split('.')
          this.ipAddressSegment.push(ipAdressObj)
          ipAdressObj = {}
        })
      },
      close_addnewNode (status) {
        this.authorizeName = '';
        this.authorizeType = '1';
        this.ipAddressSegment = [
          {
            ipAdress1: ['', '', '', ''],
            ipAdress2: ['', '', '', ''],
          }
        ];
        this.edit = false
        this.isShow_markman = status;
      },
      checked_change () {
        this.node_checked = !this.node_checked
      },
      nodeIp_reg () {
        let ip = this.ip_address;
        if (!ip.match(/^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/)) {
          this.ip_address = "";
        }
      },
      check (checked) {
        this.radio = checked
      },
      addIpAddressSegment () {
        if (this.ipAddressSegment.length < 5) {
          this.ipAddressSegment.push(
            {
              ipAdress1: ['', '', '', ''],
              ipAdress2: ['', '', '', ''],
            })
        }
      },
      ipAddress_delete (index) {
        this.ipAddressSegment.splice(index, 1)
      },

      formatJson (filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      // 新增授权
      async store_ip () {
        let infoList = [];
        let status1=false;
        let status2=false;
        this.ipAddressSegment.forEach((element, index) => {
          this.$set(this.status, index, false)
          status1 = element.ipAdress1.some(ele => ele === '')
          status2 = element.ipAdress2.some(ele => ele === '')
          if (status1 && status2) {
            this.$message({
              message: "请输入完整的ip地址",
              type: "warning"
            })
          } else if ((status1 && !status2) || (!status1 && status2)) {
            this.$set(this.status, index, true)
            this.$message({
              message: "请完善IP地址段",
              type: "warning"
            })
          }
        })

        this.ipAddressSegment.forEach((ele) => {
          let ipAddressStart = ele.ipAdress1.join('.');
          let ipAddressEnd = ele.ipAdress2.join('.');
          let infoListItem = {}
          infoListItem.ipAddressStart = ipAddressStart
          infoListItem.ipAddressEnd = ipAddressEnd
          infoList.push(infoListItem)
        })
        if (this.authorizeName == "" || status1 ||status2) {
          this.$message({
            message: "请输入完整的信息！",
            type: "warning"
          })
        } else {
          let result;
          let addAuthorizeObj = {};
          addAuthorizeObj.orgName = this.authorizeName
          addAuthorizeObj.orgType = this.authorizeType
          addAuthorizeObj.status = this.radio
          if (this.edit) {
            addAuthorizeObj.status = this.radio;
            addAuthorizeObj.id = this.editid
            addAuthorizeObj.ipAddressList = infoList
            result = await this.request('/Authorization/editAuthorization', addAuthorizeObj);
          } else {
            addAuthorizeObj.infoList = infoList;
            result = await this.request('/Authorization/addAuthorization', addAuthorizeObj)
          }
          if (result.code === '0000') {
            if (this.edit) {
              this.$message({
                message: "修改成功!",
                type: "success"
              })
            } else {
              this.$message({
                message: "添加成功!",
                type: "success"
              })
              this.pageIndex = 0;
            }
            this.authorize_status = ''
            this.isShow_markman = false;
            this.queryAuthorizationList();
          }
        }
      },
      async editStore_ip () {
        this.store_ip()
      },
      clearQuery () {
        this.startData = "";
        // this.endData = "";
        this.companyName = "";
        this.ip_address = "";
        this.authorize_status = "";
        this.org_type_name = ""
      },

      async queryAuthorize () {
        this.pageIndex = 0;
        this.queryAuthorizationList()
      },

      async queryAuthorizationList () {
        let authorizeObj = {};
        authorizeObj.pageNum = this.pageIndex + 1;
        authorizeObj.pageSize = this.pageSize;
        if (this.startData != null && this.startData[0] != undefined) {
          authorizeObj.endTime = this.startData[1];
          authorizeObj.startTime = this.startData[0];
        } else {
          authorizeObj.endTime = '';
          authorizeObj.startTime = '';
        }
        authorizeObj.orgName = this.org_type_name;
        if (this.authorize_status === '') {
          console.log('no status')
        } else {
          authorizeObj.status = this.authorize_status;
        }
        let authorizeData = await this.request('/Authorization/queryAuthorizationList', authorizeObj);
        if (authorizeData.data.list != null) {
          authorizeData.data.list.forEach((ele) => {
            ele.more_edit = true;
          })
        }
        this.authorize_list = authorizeData.data.list;
        this.aothorizeTotal = authorizeData.data.total;
      },
      async changePage (e) {
        this.pageIndex = e;
        this.queryAuthorizationList()
      },
      async changePageSize (e) {
        this.pageSize = e;
        this.pageIndex = 0
        this.queryAuthorizationList()
      },
      click_more (value) {
        value.more_edit = !value.more_edit
      },
      async openAuthorizeColony (data) {
        let openAuthorizeObj = {};
        openAuthorizeObj.id = data.id;
        openAuthorizeObj.status = 2
        let result = await this.request('/Authorization/close', openAuthorizeObj)
        if (result.code === '0000') {
          this.authorize_status = ''
          this.queryAuthorizationList()
          this.$message({
            message: "关闭成功",
            type: "success"
          })
        }
      },
      async closeAuthorizeColony (data) {
        let closeAuthorizeObj = {};
        closeAuthorizeObj.id = data.id;
        closeAuthorizeObj.status = 1
        let result = await this.request('/Authorization/open', closeAuthorizeObj)
        if (result.code === '0000') {
          this.authorize_status = ''
          this.queryAuthorizationList()
          this.$message({
            message: "开启成功",
            type: "success"
          })
        }
      },
      async delete_node (data) {
        this.authorize_list.splice(status.id, 1);
        let result = await this.request('/Authorization/delete?id=' + data.id)
        this.queryAuthorizationList()
        if (result.code === '0000') {
          this.$message({
            message: "删除成功！",
            type: "success"
          })
        }
      }

    }
  }
</script>
<style lang="scss">
  .ocr_authorize {
    .el-input__inner {
      height: 40px;
    }
    .el-range-separator{
      line-height: 24px;
    }
    .mark_authorize_status{
      .el-input__inner {
        height: 40px;
      }
    }
    .authorize_status{
      .el-input__inner {
        height: 30px;
      }
    }
    .addNewNode_mark {
      .el-input__suffix {
        height: 30px;
        margin-top: 7px;
      }
    }

    .el-input__icon {
      width: 25px;
      text-align: center;
      -webkit-transition: all .3s;
      transition: all .3s;
      height: 30px;
      position: absolute;
      right: 0;
      line-height: 30px;
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

    .submission_time {
      .el-icon-time:before {
        content: "\e78e";
      }

      .date-time {
        height: 30px;
        width: 192px;

        .el-icon-circle-close {
          position: absolute;
          right: 15px;
          line-height: 30px;
        }

        .el-input__inner {
          padding-left: 10px;
        }

        .el-input__prefix {
          left: unset;
          position: absolute;
          right: 0;
          width: 30px;

          .el-input__icon {
            line-height: 30px !important;
          }

        }
      }
    }
  }
</style>
<style scoped lang="scss">
  .ocr_authorize {
    width: 100%;
    height: 100%;

    .authorize_mainPage {
      width: 100%;
      height: 100%;

      .authorize_title {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #d0e7fa;
        box-sizing: border-box;
        padding: 0 12px;
        position: relative;

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

      .authorize_content {
        width: 100%;
        height: calc(100% - 41px);

        .statistics_search {
          height: 60px;
          width: 100%;
          position: relative;
          box-sizing: border-box;
          padding: 0 12px;
          font-size: 16px;

          & > div {
            display: inline-block;
            vertical-align: top;

            span {
              display: inline-block;
              vertical-align: top;
              width: 90px;
              margin: 0 5px;
              height: 30px;
              margin-top: 15px;
              line-height: 30px;
              text-align: right;
            }
          }

          .ip_address {
            width: 15%;
            height: 30px;
            margin: 15px 0px 0 0;


            .ip_value {
              text-indent: 10px;
              outline: none;
              border: 1px solid #ccc;
              height: 26px;
              font-size: 14px;
              width: 100%;
              border-radius: 5px;
            }
          }

          .submission_time {
            width: 38%;
            height: 30px;
            margin-top: 15px;
            /*position: absolute;*/
            /*right: 10px;*/
            text-align: right;

            span {
              margin-top: 0;
            }

            .date-time {
              height: 32px;
              width: 78%;

            }
          }

          .authorize_status {
            width: 20%;

            & > span {
              margin: 15px 0 0 0;
            }

            .authorize_status_value {
              width: calc(100% - 102px);
              height: 30px;
              border-radius: 5px;
              margin-top: 17px;
            }
          }

          .search_buttons {
            width: 300px;

            button {
              width: 80px;
              height: 32px;
              box-sizing: border-box;
              color: #fff;
              margin-top: 15px;
              outline: none;
              border: none;
              line-height: 30px;
              font-size: 14px;
              text-align: center;
              border-radius: 5px;
            }

            .search_query {
              text-indent: 20px;
              background-position: 10px center;
              background-repeat: no-repeat;
              background-color: #1579e3;
              background-size: 18px;
              background-image: url("../assets/img/statistics/search.png");
              margin: 0 10px;
            }

            .search_empty {
              background-color: #fd5e39;
            }

            .authorize_add {
              background-position: 5px center;
              background-repeat: no-repeat;
              border: 1px solid #1579e3;
              color: #1579e3;
              background-color: #fff;
              margin: 15px 10px;
              position: absolute;
              right: 0;
              line-height: 28px;
            }
          }
        }


        .authorize_items {
          height: calc(100% - 140px);
          width: 100%;
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
              &:not(.first){
                padding-left: 25px;
              }

              $arr: (120px, 280px, 340px, 240px, calc(100% - 980px));

              @for $i from 1 through length($arr) {
                &:nth-child(#{$i}) {
                  width: nth($arr, $i);
                }
              }
            }

          }

          .tr {
            border-bottom: 1px solid #e2e2e2;

            &:nth-child(2n) {
              background-color: #f7f7f7;
            }

            .td {
              display: inline-block;
              /*text-align: center;*/
              box-sizing: border-box;
              font-size: 14px;
              position: relative;
              vertical-align: middle;
              padding: 21px 0;
              &:nth-child(1) {
                text-align: center;
              }
              &:not(.first){
                padding-left: 25px;
              }
              .tdData_more, .tdData_two {
                vertical-align: middle;

                span {
                  display: inline-block;
                  line-height: 20px;
                  width: 100%;
                  box-sizing: border-box;
                  /*padding-left: 15px;*/
                }
              }

              .tdData_more {
                line-height: 30px !important;
              }

              .td_more {
                color: rgb(65, 115, 210);
                font-size: 12px;
                position: absolute;
                bottom: 18px;
                height: 30px;
                padding: 0 5px;
                line-height: 30px;
                right: 25px;
                cursor: pointer;
              }

              &:nth-child(2) {
                color: #0066dc;
              }

              &:nth-child(4) {
                &.being::after {
                  content: "正常";
                  display: inline-block;
                  color: #019f2e;
                  height: 100%;
                }

                &.prohibit::after {
                  content: "禁用";
                  display: inline-block;
                  color: #db2703;
                  height: 100%;
                  width: 60px;
                }

                &.failed::after {
                  content: "其他";
                  display: inline-block;
                  color: #db2703;
                  height: 100%;
                }
              }


              $arr: (120px, 280px, 340px, 240px, calc(100% - 980px));


              @for $i from 1 through length($arr) {
                &:nth-child(#{$i}) {
                  width: nth($arr, $i);
                }
              }
            }

            .operation {
              & > button {
                border: none;
                outline: none;
                width: 68px;
                height: 32px;
                padding: 0;
                line-height: 32px;
                box-sizing: border-box;
                text-indent: 25px;
                background-repeat: no-repeat;
                background-color: #fff;
                margin-right: 5px;
                text-align: left;
                background-position: 5px center;
                border-radius: 5px;
                background-size: 18px;
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
                /*display: none;*/
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
                /*display: none;*/
                background-image: url("../assets/img/home/sx.png");
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

        .authorize_pageNum {
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
        height: 400px;
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

          .markman_addItem {
            width: 100%;
            height: 40px;
            line-height: 40px;
            color: #333;
            font-size: 14px;
            margin: 15px 0;
            box-sizing: border-box;
            position: relative;
            box-sizing: border-box;
            padding-left: 10px;

            .ipAddressSegment {
              display: inline-block;
              vertical-align: top;
              text-align: right;
              color: #333;
              width: 80px;
              font-size: 14px;
              line-height: 40px;
            }

            .ipAddress_delete, .ipAddress_copy {
              display: inline-block;
              width: 16px;
              height: 16px;
              position: absolute;
              right: 30px;
              top: 15px;
              border-radius: 50%;
              /*background-color: #c2d9f4;*/
              margin-left: 5px;
              background-repeat: no-repeat;
              background-position: center;
              background-size: 16px;
              background-image: url("../assets/img/markman/delete.png");
            }

            .ipAddress_copy {
              /*background-color: #f7c380;*/
              background-image: url("../assets/img/markman/Delivery.png");
            }

            & > i {
              display: inline-block;
              vertical-align: top;
              height: 40px;
              line-height: 30px;
              font-style: normal;
              margin: 0 5px;
            }

            input {
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
              width: calc(100% - 140px);
            }

            .authorize_status_value {
              width: calc(100% - 140px);
            }
          }

          .markman_addItem_name {
            position: absolute;
            top: 30px;
            height: 60px;
          }

          .mark_authorize_status {
            top: 90px;
          }

          .ipAddressSegmentItems {
            min-height: 115px;
            max-height: 140px;
            margin-top: 100px;
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
          }

          /*.ipAddressSegmentItem {*/
          /*padding: unset;*/
          /*margin: 5px 0;*/
          /*height: 40px;*/
          /*line-height: 40px;*/

          /*.ipAddressSegment {*/
          /*line-height: 30px;*/
          /*}*/

          /*.IpInput {*/
          /*height: 40px;*/
          /*}*/
          /*}*/

          .addAddresssegment {
            height: 20px;
            width: 20%;
            text-align: center;
            line-height: 20px;
            color: #0a04fc;
            cursor: pointer;
            font-size: 14px;
            margin-left: 80px;
            display: inline-block;
            position: absolute;
            bottom: 60px;
          }

          .addItem_radio {
            width: calc(80% - 80px);
            height: 40px;
            color: #333;
            display: inline-block;
            vertical-align: top;
            font-size: 14px;
            box-sizing: border-box;
            text-align: center;
            position: absolute;
            bottom: 60px;
            left: 200px;
            margin: 14px 0 0 0;

            .radio-box {
              display: inline-block;
              position: relative;
              height: 18px;
              line-height: 18px;
              margin-right: 5px;
              width: 80px;
            }

            .radio {
              display: inline-block;
              width: 18px;
              height: 18px;
              vertical-align: middle;
              cursor: pointer;
              margin-right: 5px;
              background-size: 18px;
              background-image: url("../assets/img/markman/dx-.png");
              background-repeat: no-repeat;
              background-position: center center;
            }

            .input-radio {
              display: inline-block;
              position: absolute;
              opacity: 0;
              width: 80px;
              height: 18px;
              line-height: 20px;
              cursor: pointer;
              left: 0px;
              outline: none;
              -webkit-appearance: none;
            }

            .spare_node_check, .main_node_check {
              background-image: url("../assets/img/markman/dx-.png");
            }

            .on {
              background-image: url("../assets/img/markman/dx.png");
            }

          }

        }
      }
    }
  }
</style>
