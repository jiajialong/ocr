<template>
  <div class="ocr_task">
    <div class="task_title"><span>任务管理</span></div>
    <div class="task_content">
      <div class="task_module">
        <div class="task_item task_processed">
          <div class="task_already">
            <div>今日已处理</div>
            <div class="task_compare">
              <span>比昨日同时：{{TodayGrowth.result}}%</span>
              <i class="up_down up" v-show="TodayGrowth.flag === '1' || TodayGrowth.flag === '3'"></i>
              <i class="up_down dowm" v-show="TodayGrowth.flag === '2'"></i>
              <!--<i class="up_down up" v-show=""></i>-->
            </div>
          </div>
          <div class="task_already_num"><span class="already_num">{{TaskInfoData.totalNum||0}}</span>页</div>
        </div>
        <div class="task_item task_BeingProcessed">
          <div class="task_already">
            <div class="beingProcessed_all">正在处理页数/任务数</div>
          </div>
          <div class="task_already_num">
            <span class="already_num being_all">{{TaskInfoData.doingNum||0}}</span>页
            <i>/</i>
            <span class="already_num">{{TaskInfoData.taskNum||0}}</span>个
          </div>
        </div>
        <div class="task_item task_load">
          <div class="task_already">
            <div>节点负载</div>
            <!--<div class="task_compare">-->
            <!--<span>比昨日平均负载：80.22%</span>-->
            <!--<i class="up_down up" v-show="up_dowm"></i>-->
            <!--<i class="up_down dowm" v-show="!up_dowm"></i>-->
            <!--</div>-->
          </div>
          <div class="task_already_num"><span class="already_num">{{queryLoadRecordRate}}</span>%</div>
        </div>
        <div class="task_echart">
          <div class="select_week">负载节点走势：
            <el-date-picker
              v-model="nodeDate"
              class="date-time"
              type="date"
              format="yyyy-MM-dd"
              @change="showNodeDate('select')"
              :picker-options="pickerOptionsStart"
              placeholder="开始日期">
            </el-date-picker>
          </div>
          <div class="task_echart_main" id="task_echart"></div>
        </div>
      </div>
      <div class="task_search">
        <div class="ip_address"><input class="ip_value" placeholder="IP地址" @blur="nodeIp_reg" v-model="ip_address"/>
        </div>
        <div class="submission_time">
          <span>提交时间：</span>
          <el-date-picker
            v-model="startDate"
            class="date-time"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :picker-options="pickerOptionsStart"
            placeholder="开始时间"></el-date-picker>
          <!--~-->
          <!--<el-date-picker v-model="endDate" @change="compareTime" value-format="yyyy-MM-dd HH:mm:ss" class="date-time" type="datetime" placeholder="结束时间"></el-date-picker>-->
        </div>
        <div class="task_status ip_address">
          <span>任务状态：</span>
          <el-select class="task_status_value" v-model="task_status" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="search_buttons">
          <button class="search_query" @click="query_task">查询</button>
          <button class="search_empty" @click="ClearCondition">清空条件</button>
        </div>
      </div>

      <div class="task_items">
        <div class="th">
          <div class="td first">序号</div>
          <div class="td">名称</div>
          <div class="td">文件大小</div>
          <div class="td">任务状态</div>
          <div class="td">处理节点</div>
          <div class="td">任务来源</div>
          <div class="td">终端IP地址</div>
          <div class="td">提交时间</div>
        </div>
        <div class="tbody">
          <div class="tr" v-for="(item,index) in taskList" :key="index">
            <div class="td first">{{index+1+pageSize*pageIndex}}</div>
            <div class="td" :title="item.fileName">{{item.fileName}}</div>
            <div class="td">{{getSizeText(item.fileSize)}}</div>
            <!--item.fileSize/1022/1022-->
            <div class="td"
                 :class="{being:item.taskStatus===1,succeed:item.taskStatus === 2,failed:item.taskStatus === 3}"></div>
            <div class="td">{{item.clusterName}}</div>
            <div class="td">{{item.nodeName}}</div>
            <div class="td">{{item.terminalIp}}</div>
            <div class="td">{{item.createTime}}</div>
          </div>
          <div class="ocr_scrollbar"></div>
        </div>
      </div>
      <div class="task_pageNum">
        <pagination :page-index.sync="pageIndex" :page-size.sync="pageSize" @page="changePage" :total='taskTotal'
                    @limit="changePageSize"></pagination>
        <!--<pagination :page="pageIndex" :limit="pageSize" @page="pageIndex = $event" :total='taskTotal' @limit="pageSize = $event"></pagination>-->
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import pagination from '../components/page'

  export default {
    name: "Task",
    data () {
      return {
        up_dowm: 3,
        ip_address: "",
        startDate: "",
        nodeDate: "",
        // endDate: "",
        pageIndex: 0,
        pageSize: 10,
        taskTotal: 0,
        TodayGrowth:{},
        taskList: [],
        nodeWeek:[],
        TaskInfoData: {},
        queryLoadRecordRate:0,
        options: [{value: 1, label: '转换中'}, {value: 2, label: '转换成功'}, {value: 3, label: '转换失败'}],
        task_status: '',
        ocr_th: ["序号", "名称", "文件大小", "任务状态", "处理节点", "任务来源", "终端IP地址", "提交时间"],
        ocr_td: [{}, {}, {}],
        pickerOptionsStart: {
          disabledDate: (time) => {
            return time.getTime() > new Date().getTime();
          }
        },
      }
    },
    components: {
      pagination
    },
    mounted () {
      this.queryTaskManageList();
      this.change_style();
      this.countTaskInfo();
      let taskEchart = document.getElementById('task_echart')
      let myChart = this.$echarts.init(taskEchart);
      //获取week
      this.showNodeDate('default')
      window.addEventListener("resize", () => {
        myChart.resize({width: taskEchart.offsetWidth, height: taskEchart.offsetHeight})
      })
    },
    methods: {
      change_style () {
        let line = document.querySelector('.el-range-separator');
        line.innerHTML = "~"
      },
      nodeIp_reg () {
        let ip = this.ip_address;
        if (this.ip_address == '') {
          console.log('IP地址为空')
        } else {
          if (!ip.match(/^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/)) {
            this.ip_address = ""
            this.$message({
              message: "请输入正确的IP地址",
              type: "warning"
            })
          }
        }

      },
      async countTaskInfo () {
        // TaskManage/countTaskInfo
        let queryLoadRecordRate = await this.request('/TaskManage/queryLoadRecordRate');
        let countTaskInfoData = await this.request('/TaskManage/countTaskInfo');
        let TodayGrowth = await this.request('/TaskManage/yesterdayOnTodayGrowth');
        console.log(TodayGrowth.data);
        this.TodayGrowth = TodayGrowth.data;
        this.queryLoadRecordRate = queryLoadRecordRate.data;
        this.TaskInfoData = countTaskInfoData.data
      },
      async query_task () {
        this.pageIndex = 0;
        this.queryTaskManageList()
      },
      async queryTaskManageList () {
        let queryCriteria = {};
        queryCriteria.address = this.ip_address;
        if (this.startDate != null && this.startDate[0] != undefined) {
          queryCriteria.endTime = this.startDate[1];
          queryCriteria.startTime = this.startDate[0];
        } else {
          queryCriteria.endTime = '';
          queryCriteria.startTime = '';
        }
        queryCriteria.pageNum = this.pageIndex + 1;
        queryCriteria.pageSize = this.pageSize;
        if (this.task_status === "") {
          console.log('no taskStatus')
        } else {
          queryCriteria.fileStatus = this.task_status;
        }
        let queryTaskData = await this.request('/TaskManage/queryTaskManageList', queryCriteria);
        if (queryTaskData.data.list != null) {
          queryTaskData.data.list.forEach((ele) => {
            ele.createTime = moment(ele.createTime).format('YYYY-MM-DD HH:mm:ss')
            if (ele.orgType === 1) {
              ele.orgType_labal = '单位'
            } else if (ele.orgType === 2) {
              ele.orgType_labal = '系统'
            }
          })
        }
        this.taskList = queryTaskData.data.list
        this.taskTotal = queryTaskData.data.total
      },
      ClearCondition () {
        /*
        *  ip_address: "",
           startDate: "",
           endDate: "",
         task_status:"",
        * */
        this.ip_address = "";
        this.startDate = "";
        this.task_status = "";
      },
      async showNodeDate(value){
        let Week = [];
        let weekday = '';
        if(value==='default' || this.nodeDate == null){
          weekday = new Date()
        }else if(value === 'select'){
          weekday = this.nodeDate
        }
        for (let i = 0; i <7 ; i++) {
          let wday = moment(weekday).subtract(i, "days").format("MM月DD日")
          Week.push(wday)
          wday = '';
        }
        let nodeWeekObj = {};
        nodeWeekObj.startTime = moment(weekday).subtract(6, "days").format("YYYY-MM-DD")
        nodeWeekObj.endTime = moment(weekday).subtract(0, "days").format("YYYY-MM-DD")
        let myChartData = await this.request('/TaskManage/querySevenDayRate', nodeWeekObj)
        this.nodeWeek = Week
        let taskEchart = document.getElementById('task_echart')
        let myChart = this.$echarts.init(taskEchart);
        let option = {
          grid: {
            top: 20,
            left: 38,
            right: 0,
            bottom: 25
          },
          xAxis: {
            type: 'category',
            data: this.nodeWeek,
            boundaryGap: ['10%', '10%',],//坐标轴两边留白
            minInterval: 1,
            axisLine: {//坐标轴
              lineStyle: {
                opacity: 0.01,//设置透明度就可以控制显示不显示
              },
            },
            splitLine: {//网格线
              show: false,//网格线
              lineStyle: {
                color: '#eeeeee',
              },
            },
            axisTick: {//刻度线
              show: false,//去掉刻度线
            },
          },
          yAxis: {
            min: 0,//最小刻度
            max: 100,//最大刻度
            type: 'value',
            splitNumber: 2,
            // type: 'value'
            axisLabel: {
              formatter: '{value}%'
            },
            nameTextStyle: {
              color: '#444e65',
              align: 'right',//文字水平对齐方式
              verticalAlign: 'middle',//文字垂直对齐方式
            },
            axisTick: {//刻度线
              show: false,//去掉刻度线
            },
            axisLine: {//坐标轴线
              lineStyle: {
                opacity: 0,//透明度为0
              },
            },
            splitLine: {//网格线
              // show: false,//网格线
              lineStyle: {
                color: '#eeeeee',
              },
            },
          },
          series: [{
            data: myChartData.data,//数据
            type: 'line',//图表类型，折线图还是柱状图还是饼图
            label: {//图形上的文本标签
              normal: {
                formatter: '',
                show: true,//显示数据
                color: '#DB6145',
                position: 'top',
                fontSize: '14',
              },
            },
            itemStyle: {//折线拐点标志的样式。
              normal: {
                color: '#DB6145',
              },
            },
            areaStyle: {//区域填充样式
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(219, 97, 69, 0.4)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(219, 97, 69, 0.01)',
                    },
                  ],
                  globaCoord: false,
                },
              },
            },
          },],
        };
        myChart.setOption(option);
      },
      //翻页
      async changePage (e) {
        this.pageIndex = e;
        this.queryTaskManageList()
      },
      async changePageSize (e) {
        this.pageSize = e;
        this.pageIndex = 0
        this.queryTaskManageList();
      },

      getSizeText (size) {
        let tb = size / 1024 / 1024 / 1024 / 1024
        if (tb > 1) return Math.round(tb) + 'TB'

        let gb = size / 1024 / 1024 / 1024
        if (gb > 1) return Math.round(gb) + 'GB'

        let mb = size / 1024 / 1024
        if (mb > 1) return Math.round(mb) + 'MB'

        let kb = size / 1024
        if (kb > 1) return Math.round(kb) + 'KB'

        return size + 'B'
      }
    }
  }
</script>
<style lang="scss">
  .ocr_task {
    .el-input__inner {
      height: 30px;
    }

    .el-range-separator {
      line-height: 24px;
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

    .el-input__icon {
      height: 100%;
      width: 25px;
      text-align: center;
      /*-webkit-transition: all .3s;*/
      transition: all .3s;
      line-height: 30px;
      position: absolute;
      right: 0;
    }

    .el-icon-time:before {
      content: "\e78e";
    }

    .date-time {
      height: 30px;
      width: 192px;
      /*.el-input--prefix{} .el-input__inner*/
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
</style>
<style scoped lang="scss">
  .ocr_task {
    width: 100%;
    height: 100%;

    .task_title {
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

    .task_content {
      width: 100%;
      height: calc(100% - 41px);
      box-sizing: border-box;
      padding: 12px;

      .task_module {
        width: 100%;
        height: 140px;
        /*background-color: lavender;*/
        position: relative;

        .task_item {
          display: inline-block;
          vertical-align: top;
          margin-right: 25px;
          width: 340px;
          height: 120px;
          margin-top: 10px;
          background-position: center center;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          box-sizing: border-box;

          &:nth-child(3){
            margin-right: 15px;
          }

          .task_already {
            width: 100%;
            height: 35px;
            font-size: 0;
            position: relative;
            font-size: 14px;
            padding: 10px 10px 0 10px;
            box-sizing: border-box;
            border-bottom: 1px solid #fff;

            & > div {
              display: inline-block;
              vertical-align: top;
              color: #fff;
              font-size: 14px;
            }

            & > div:nth-child(1) {
              font-weight: bold;
              /*margin-right: 10px;*/
              padding: 0 2px;
              /*width: 85px;*/
              box-sizing: border-box;
            }

            .task_compare {
              height: 20px;
              line-height: 20px;
              /*background-color: #6a85cd;*/
              box-sizing: border-box;
              border-radius: 10px;
              /*position: relative;*/
              width: calc(100% - 85px);
              font-size: 14px;
              text-align: center;
              position: absolute;
              top: 11px;
              right: 0;

              & > span {
                display: inline-block;
                width: 70%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .up_down {
                position: absolute;
                right: 12px;
                top: 2px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-position: center center;
                background-repeat: no-repeat;
                background-size: 18px;
              }

              .up {
                background-image: url("../assets/img/task/up.png");
              }

              .dowm {
                background-image: url("../assets/img/task/down.png");
              }
            }
          }


          .task_already_num {
            width: 100%;
            height: 60px;
            line-height: 60px;
            box-sizing: border-box;
            padding: 10px 15px;
            font-weight: bold;
            color: #fff;
            margin-top: 10px;
            font-size: 16px;


            .already_num {
              color: #fff;
              font-size: 48px;
              margin-right: 12px;
            }

            i {
              font-style: normal;
              margin: 0 10px;
            }
          }
        }

        .task_processed {
          background-image: url("../assets/img/task/01.png");
        }

        .task_BeingProcessed {
          background-image: url("../assets/img/task/02.png");
        }

        .task_load {
          background-image: url("../assets/img/task/03.png");
        }

        .task_echart {
          position: absolute;
          top: 10px;
          right: 0;
          width: 580px;
          height: 120px;
          background-color: #f8f8f8;
          box-sizing: border-box;
          padding: 5px 10px;

          .select_week {
            height: 30px;
            width: 100%;
            font-size: 16px;
          }

          .task_echart_main {
            height: calc(100% - 30px);
            width: 100%;
          }

          /*background-color: red;*/
        }
      }

      .task_search {
        height: 60px;
        width: 100%;
        position: relative;
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
          width: 180px;
          height: 30px;
          margin-top: 15px;


          .ip_value {
            text-indent: 10px;
            outline: none;
            border: 1px solid #ccc;
            height: 26px;
            width: 100%;
            border-radius: 5px;
          }
        }

        .submission_time {
          width: 512px;
          height: 30px;
          margin-top: 15px;

          span {
            margin-top: 0;
          }

          .date-time {
            height: 30px;
            width: 410px;
          }
        }

        .task_status {
          width: 270px;

          span {
            margin-top: 0;
          }

          .task_status_value {
            width: calc(100% - 102px);
            height: 30px;
            border-radius: 5px;
          }
        }

        .search_buttons {
          width: 180px;
          /*position: absolute;*/
          /*right: 0;*/

          button {
            width: 80px;
            height: 30px;
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
            background-image: url("../assets/img/task/search.png");
            margin: 0 10px;
          }

          .search_empty {
            background-color: #fd5e39;
          }
        }

        /*background-color: #eee;*/
      }

      .task_pageNum {
        height: 80px;
        width: 100%;
        /*background-color: lavender;*/
        position: relative;
      }

      .task_items {
        height: calc(100% - 267px);
        width: 100%;

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
              padding-left: 15px;
            }


            $arr: (80px, 240px, calc((100% - 820px) / 3), 120px, calc((100% - 820px) / 3), calc((100% - 820px) / 3), 160px, 220px);

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
            /*text-align: center;*/
            line-height: 75px;
            box-sizing: border-box;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: default;

            &:nth-child(1) {
              text-align: center;
            }

            &:not(.first) {
              padding-left: 15px;
            }

            &:nth-child(2) {
              /*overflow: hidden;*/
              /*text-overflow:ellipsis;*/
              /*white-space: nowrap;*/
              color: #0066dc;
            }

            &:nth-child(4) {
              &.being::after {
                content: "转换中";
                display: inline-block;
                color: #0066dc;
                height: 100%;
              }

              &.succeed::after {
                content: "转换成功";
                display: inline-block;
                color: #019f2e;
                height: 100%;
              }

              &.failed::after {
                content: "转换失败";
                display: inline-block;
                color: #db2703;
                height: 100%;
              }
            }

            $arr: (80px, 240px, calc((100% - 820px) / 3), 120px, calc((100% - 820px) / 3), calc((100% - 820px) / 3), 160px, 220px);

            @for $i from 1 through length($arr) {
              &:nth-child(#{$i}) {
                width: nth($arr, $i);
              }
            }
          }
        }
      }
    }
  }
</style>
