<template>
  <div class="ocr_colony">
    <div class="colony_mainPage">
      <div class="colony_title"><span>集群</span></div>
      <div class="colony_content">
        <div class="colony_add"><span class="addNewNode" @click="change_addnewNode()">+新建节点</span></div>
        <div class="colony_items">
          <div class="th">
            <div class="td first">序号</div>
            <div class="td">名称</div>
            <div class="td">节点类型</div>
            <div class="td">IP</div>
            <div class="td">请求余量</div>
            <div class="td">每秒处理</div>
            <div class="td">节点状态</div>
            <div class="td">操作</div>
          </div>
          <div class="tbody">
            <div class="tr" v-for="(item,index) in colonyList" :key="index">
              <div class="td first">{{index+1+pageSize*pageIndex}}</div>
              <div class="td">{{item.clusterName}}</div>
              <div class="td">{{item.nodeType_labal}}</div>
              <div class="td">{{item.ip}}</div>
              <div class="td">{{item.requestSurplusQuantity}}次</div>
              <div class="td">{{item.dps}}QPS</div>
              <div class="td"
                   :class="{being:item.nodeStatus===1,prohibit:item.nodeStatus === 2,failed:item.nodeStatus === 3}"></div>
              <div class="td tool_button">
                <!--<span style="position: absolute;top: 0;">{{item.add_status}}</span>-->
                <button class="rpohibit" v-show="item.nodeStatus == 1" @click="openColony(item)">禁用</button>
                <button class="edit"
                        v-show=" item.nodeStatus == 2 || item.nodeStatus == 3"
                        @click="change_addnewNode(item)">编辑
                </button>
                <button class="open" v-show="item.nodeStatus == 2" @click="closeColony(item)">开启</button>
                <!--<button class="refresh" v-show="item.nodeStatus == 3">刷新</button>-->
                <button class="delete"
                        v-show=" item.nodeStatus == 2 || item.nodeStatus == 3"
                        @click="delete_node(item)">删除
                </button>
              </div>
            </div>
            <div class="ocr_scrollbar"></div>
          </div>
        </div>
        <div class="colony_pageNum">
          <!--@limit="pageSize = $event"-->
          <pagination :page-index.sync="pageIndex" :page-size.sync="pageSize" @page="changePage" :total='colonyTotal'
                      @limit="changePageSize"></pagination>
        </div>
      </div>
    </div>
    <div class="addNewNode_mark" v-show="isShow_markman">
      <div class="markman_content">
        <div class="markman_title">
          <div class="markman_title_left" v-show="!add_nodeId">新增算力节点</div>
          <div class="markman_title_left" v-show="add_nodeId">编辑算力节点</div>
          <div class="markman_title_right" @click="close_addnewNode"></div>
        </div>
        <div class="markman_main">
          <div class="markman_addItem">
            <span>名称：</span><input placeholder="请输入算力名称" v-model="add_nodeName"/><span class="Must"
                                                                                       v-show="isShow_must">*</span>
          </div>
          <div class="markman_addItem">
            <span>IP地址：</span><input placeholder="请输入IP地址" v-model="add_nodeIp" @blur="nodeIp_reg"/><span class="Must"
                                                                                                          v-show="isShow_must">*</span>
          </div>
          <div class="markman_addItem">
            <span>请求余量：</span><input placeholder="请输入请求余量，没有则不填" @blur="nodeMargin_reg" v-model="add_nodeMargin"/>次
          </div>
          <div class="markman_addItem">
            <span>每秒处理：</span><input placeholder="请输入每秒处理量" @blur="nodeHandle_reg" v-model="add_nodeHandle"/><span
            class="Must"
            v-show="isShow_must">*</span>QPS
          </div>
          <div class="addItem_radio">
            <div class="radio-box">
              <span class="radio" :class="{'on':radio === 1}"></span>
              <input v-model="radio" :value="radio" class="input-radio" @click="check(1)" type="radio">主节点
            </div>
            <div class="radio-box">
              <span class="radio" :class="{'on':radio === 2}"></span>
              <input v-model="radio" :value="radio" class="input-radio" @click="check(2)" type="radio">备用节点
            </div>
          </div>
        </div>
        <div class="add_button">
          <button class="add_cancel" @click="close_addnewNode">取消</button>
          <button class="add_conform add" v-show="!add_nodeId" @click="add_nodeItem()">确定新增</button>
          <button class="add_conform edit" v-show="add_nodeId" @click="edit_conform()">确定</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import pagination from '../components/page'
  import {mapState} from 'vuex';

  export default {
    name: "Colony",
    data () {
      return {
        pageIndex: 0,
        pageSize: 10,
        botton_status: 'failed',
        radio: 1,
        node_checked: true,
        isShow_markman: false,
        add_nodeId: '',
        add_nodeName: '',
        add_nodeIp: '',
        add_nodeMargin: '',
        add_nodeHandle: '',
        isShow_must: false,
        colonyTotal: 0,
        login_username: "",
        name: "",
        colonyList: [],
      }
    },
    components: {
      pagination
    },
    mounted () {
      this.getList()
    },
    computed: {
      ...mapState({
        ocr_td: state => state.ocr_td
      }),
      //本地存储不分页的
      // ocr_td_list () {
      //   let startIndex = 0
      //   startIndex = this.pageIndex * this.pageSize
      //   let endIndex = 0
      //   endIndex = (this.pageIndex + 1) * this.pageSize - 1
      //   console.log('pageIndex', this.pageIndex, 'pageSize', this.pageSize)
      //   console.log('startIndex', startIndex, 'endIndex', endIndex)
      //   console.log('totalCount', this.ocr_td.length)
      //   return this.colonyList.filter((item, index) => startIndex <= index && index <= endIndex)
      // }
    },
    methods: {
      change_addnewNode (status = {}) {
        console.log(status.nodeType)
        this.add_nodeId = status.id
        this.add_nodeName = status.clusterName
        this.add_nodeIp = status.ip
        this.add_nodeMargin = status.requestSurplusQuantity
        this.add_nodeHandle = status.dps
        if(status.nodeType!=undefined){
          this.radio = status.nodeType
        }else{
          this.radio = 1
        }
        this.isShow_markman = true
        this.isShow_must = false

      },
      close_addnewNode () {
        this.isShow_markman = false
      },

      check (checked) {
        this.radio = checked
      },
      // 页面list获取
      //  1:运行中 2:已禁用  3:运行错误',
      // 1:开启 2:关闭
      async getList () {
        let colonyObj = {};
        colonyObj.pageNum = this.pageIndex + 1;
        colonyObj.pageSize = this.pageSize;
        let colonyData = await this.request('/ClusterInfo/queryPageList', colonyObj);
        if (colonyData.data.list != null) {
          colonyData.data.list.forEach((ele) => {
            if (ele.nodeType === 1) {
              ele.nodeType_labal = '主节点'
            } else if (ele.nodeType === 2) {
              ele.nodeType_labal = '备用节点'
            }
          })
        }
        this.colonyTotal = colonyData.data.total
        this.colonyList = colonyData.data.list
      },
      // {id:""}
      // 开启 禁用
      async openColony (data) {
        let openColonyObj = {};
        openColonyObj.id = data.id;
        openColonyObj.status = 2
        let result = await this.request('/ClusterInfo/close', openColonyObj)
        if (result.code === '0000') {
          this.getList()
        }
      },
      async closeColony (data) {
        let closeColonyObj = {};
        closeColonyObj.id = data.id;
        closeColonyObj.status = 1
        let result = await this.request('/ClusterInfo/open', closeColonyObj)
        if (result.code === '0000') {
          this.getList()
        }
      },
      async add_nodeItem () {
        // {
        //   "clusterName": "string",
        //   "dps": 0,
        //   "ip": "string",
        //   "nodeStatus": 0,
        //   "nodeType": 0,
        //   "requestSurplusQuantity": 0
        // }
        let nodeItem = {}
        nodeItem.clusterName = this.add_nodeName;
        nodeItem.ip = this.add_nodeIp;
        nodeItem.requestSurplusQuantity = this.add_nodeMargin || 0;
        nodeItem.dps = this.add_nodeHandle;
        nodeItem.nodeStatus = 1;
        nodeItem.nodeType = this.radio;
        if (!this.add_nodeName || !this.add_nodeIp || !this.add_nodeHandle) {
          this.isShow_must = true
          this.$message({
            message: "请填写完整的信息",
            type: "warning"
          })
          return;
        } else {
          let result = await this.request('/ClusterInfo/addClusterInfo', nodeItem);
          if (result.code === '0000') {
            this.$message({
              message: "添加成功",
              type: "success"
            })
          }
          this.pageIndex = 0;
          this.getList()
          this.isShow_markman = false
        }

      },
      async edit_conform () {
        let nodeItem = {}
        nodeItem.id = this.add_nodeId;
        nodeItem.clusterName = this.add_nodeName;
        nodeItem.ip = this.add_nodeIp;
        nodeItem.requestSurplusQuantity = this.add_nodeMargin || 0;
        nodeItem.dps = this.add_nodeHandle;
        nodeItem.nodeStatus = 1;
        nodeItem.nodeType = this.radio;
        if (!this.add_nodeName || !this.add_nodeIp || !this.add_nodeHandle) {
          this.isShow_must = true
          this.$message({
            message: "请填写完整的信息",
            type: "warning"
          })
          return;
        } else {
          let result = await this.request('/ClusterInfo/editClusterInfo', nodeItem);
          if (result.code === '0000') {
            this.$message({
              message: "修改成功",
              type: "success"
            })
          }
          this.getList()
          this.isShow_markman = false
        }
      },
      async delete_node (data) {
        this.colonyList.splice(status.id, 1);
        let result = await this.request('/ClusterInfo/delete?id=' + data.id)
        if (result.code === '0000') {
          this.getList();
          this.$message({
            message: "删除成功！",
            type: "success"
          })
        }
      },
      //正则
      nodeIp_reg () {
        let ip = this.add_nodeIp;
        if(this.add_nodeIp === ''){
          console.log('IP地址为空！')
        }else{
          if (!ip.match(/^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/)) {
            this.add_nodeIp = ''
            this.$message({
              message: "请输入正确的IP地址",
              type: "warning"
            })
          }
        }
      },
      nodeMargin_reg () {
        let modeMargin = this.add_nodeMargin;
        if (this.ip_address == '') {
          console.log('请求余量为空!')
        }else{
          if (!modeMargin.match(/^[0-9><=]+$/)) {
            this.add_nodeMargin = '';
            this.$message({
              message: "请输入正确的请求余量(仅限数字)",
              type: "warning"
            })
          }
        }

      },
      nodeHandle_reg () {
        let nodeHandle = this.add_nodeHandle;
        if(this.add_nodeHandle === ''){
          console.log('每秒处理量为空！')
        }else{
          if (!nodeHandle.match(/^[0-9><=]+$/)) {
            this.add_nodeHandle = ''
            this.$message({
              message: "请输入正确的每秒处理量(仅限数字)",
              type: "warning"
            })
          }
        }

      },
      //翻页
      async changePage (e) {
        this.pageIndex = e;
        this.getList()
      },
      async changePageSize (e) {
        this.pageSize = e;
        this.pageIndex = 0
        this.getList();
      }
    }
  }
</script>

<style scoped lang="scss">
  .ocr_colony {
    width: 100%;
    height: 100%;

    .colony_mainPage {
      width: 100%;
      height: 100%;

      .colony_title {
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

      .colony_content {
        width: 100%;
        height: calc(100% - 41px);

        .colony_add {
          width: 100%;
          height: 60px;
          box-sizing: border-box;
          padding: 0 12px;
          cursor: pointer;

          .addNewNode {
            display: inline-block;
            width: 78px;
            height: 30px;
            text-align: center;
            line-height: 30px;
            border: 1px solid #4290d9;
            border-radius: 5px;
            color: #0658a5;
            font-size: 14px;
            margin-top: 14px;
          }
        }

        .colony_items {
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
              &:not(.first){
                padding-left: 15px;
              }
              $arr: (80px, 220px, calc((100% - 740px) / 4), 200px, calc((100% - 740px) / 4), calc((100% - 740px) / 4), calc((100% - 740px) / 4), 240px);

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

            .td {
              display: inline-block;
              line-height: 75px;
              box-sizing: border-box;
              font-size: 14px;
              position: relative;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
              cursor: default;

              &:nth-child(2) {
                color: #0066dc;
              }
              &:nth-child(1) {
                text-align: center;
              }
              &:not(.first){
                padding-left: 15px;
              }

              &:nth-child(7) {
                &.being::after {
                  content: "运行中";
                  display: inline-block;
                  color: #019f2e;
                  height: 100%;
                }

                &.prohibit::after {
                  content: "已禁用";
                  display: inline-block;
                  color: #db2703;
                  height: 100%;
                }

                &.failed::after {
                  content: "运行错误";
                  display: inline-block;
                  color: #db2703;
                  height: 100%;
                }

                &.loading::after {
                  content: "";
                  display: inline-block;
                  height: 75px;
                  top: -43px;
                  left: 33px;
                  width: 75px;
                  position: absolute;
                  background-position: center center;
                  background-repeat: no-repeat;
                  background-image: url('../assets/img/home/loading.png');
                  background-size: 30% 30%;
                  animation: rotate 3s linear infinite;
                }
              }

              @keyframes rotate {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              $arr: (80px, 220px, calc((100% - 740px) / 4), 200px, calc((100% - 740px) / 4), calc((100% - 740px) / 4), calc((100% - 740px) / 4), 240px);

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
          }
        }

        .colony_pageNum {
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
        height: 420px;
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
            height: 60px;
            line-height: 60px;
            color: #333;
            font-size: 14px;
            margin: 5px 0;
            box-sizing: border-box;
            padding: 0 10px;
            position: relative;

            .Must {
              position: absolute;
              right: 42px;
              width: 20px;
              line-height: 60px;
              color: #ff0000;
            }

            & > span {
              display: inline-block;
              vertical-align: top;
              text-align: right;
              color: #333;
              width: 80px;
              font-size: 14px;
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
              width: calc(100% - 130px);
              margin-right: 10px;
            }
          }

          .addItem_radio {
            width: 100%;
            height: 40px;
            color: #333;
            font-size: 14px;
            margin: 5px 0;
            box-sizing: border-box;
            padding: 0 10px 0 90px;
            margin: 0px;
            position: relative;

            .radio-box {
              display: inline-block;
              position: relative;
              height: 18px;
              line-height: 18px;
              margin-right: 5px;
              width: 100px;
            }

            .radio {
              display: inline-block;
              width: 18px;
              height: 18px;
              vertical-align:top;
              margin-right: 5px;
              cursor: pointer;
              background-image: url("../assets/img/markman/dx-.png");
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 18px;
            }

            .input-radio {
              display: inline-block;
              position: absolute;
              opacity: 0;
              width: 80px;
              height: 18px;
              line-height: 18px;
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
