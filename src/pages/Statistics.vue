<template>
  <div class="ocr_statistics">
    <div class="statistics_title"><span>统计</span></div>
    <div class="statistics_content">
      <div class="statistics_modules">
        <div class="statistics_module statistics_all">
          <div class="module-item right_line">
            <div class="module-name">本月累计处理</div>
            <div class="module-value"><span class="module_num">{{all_tatol}}</span>页</div>
          </div>
        </div>
        <div class="statistics_module statistics_pdf">
          <div class="module-item right_line">
            <div class="module-name">本月PDF处理</div>
            <div class="module-value"><span class="module_num">{{pdf_tatol}}</span>页</div>
          </div>
        </div>
        <div class="statistics_module statistics_img">
          <div class="module-item">
            <div class="module-name">本月图片处理</div>
            <div class="module-value"><span class="module_num">{{img_total}}</span>页</div>
          </div>
        </div>
      </div>
      <div class="statistics_search">
        <div class="ip_address"><input class="ip_value" placeholder="名称" v-model="companyName"/></div>
        <div class="task_status ">
          <el-select class="task_status_value" @change="clearValue" v-model="task_status" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="submission_time" v-for="(item,index) in options" v-show="item.value == task_status" :key="index">
          <span>提交时间：</span>
          <div class="year" v-show="task_status !== 'datetimerange'">
            <!--:picker-options="pickerOptionsStart"-->
            <el-date-picker v-model="startData" :picker-options="pickerOptionsStart" class="date-time"
                            :type="task_status" placeholder="开始日期"></el-date-picker>
          </div>
          <!--:picker-options="pickerOptionsStart"-->
          <div class="mounth_day" v-show="task_status ==='datetimerange'">
            <el-date-picker
              v-model="rangeData"
              class="date-time"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              :picker-options="pickerOptionsStart"
              placeholder="开始时间"></el-date-picker>
          </div>
        </div>
        <div class="search_buttons">
          <button class="search_query" @click="queryData">查询</button>
          <button class="search_empty" @click="clearQuery">清空条件</button>
          <button class="search_export" @click="export2Excel">导出</button>
        </div>
      </div>
      <div class="statistics_items">
        <div class="th">
          <div class="td first">序号</div>
          <div class="td">名称</div>
          <div class="td">IP地址</div>
          <div class="td">累计处理（页）</div>
          <div class="td">PDF处理（页）</div>
          <div class="td">图片处理（页）</div>
        </div>
        <div class="tbody">
          <div class="tr" v-for="(item,index) in statisticList" :key="index">
            <div class="td first">{{index+1+pageSize*pageIndex}}</div>
            <div class="td">{{item.orgName}}</div>
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
            <div class="td">{{item.total}}</div>
            <div class="td">{{item.pdfTotal}}</div>
            <div class="td">{{item.imgTotal}}</div>
          </div>
          <div class="ocr_scrollbar"></div>
        </div>
      </div>
      <div class="statistics_pageNum">
        <pagination :page-index.sync="pageIndex" :page-size.sync="pageSize" @page="changePage" :total='statisticTotal'
                    @limit="changePageSize"></pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import pagination from '../components/page'
  import moment from 'moment'


  export default {
    name: "Task",
    data () {
      return {
        pageIndex: 0,
        pageSize: 10,
        startData: "",
        ip_address: "",
        companyName: "",
        rangeData: "",
        statisticTotal: 0,
        statisticList: [],
        statisticExcelList: [],
        pdf_tatol: 0,
        all_tatol: 0,
        img_total: 0,
        isQuery: false,
        ipAddressSegment: [
          {
            ipAdress1: ['', '', '', ''],
            ipAdress2: ['', '', '', ''],
          }
        ],
        task_status_value: "",
        options: [{value: 'year', label: '年'}, {value: 'month', label: '月'}, {
          value: 'date',
          label: '日'
        }, {value: 'datetimerange', label: "时间"}],
        task_status: "date",
        ocr_th: ["序号", "名称", "IP地址", "累计处理（页）", "PDF处理（页）", "图片处理（页）"],
        pickerOptionsStart: {
          disabledDate: (time) => {
            // if (this.endData != "") {
            return time.getTime() > new Date().getTime();
            // }
          }
        },
        // pickerOptionsEnd: {
        //     disabledDate: (time) => {
        //       return time.getTime() < new Date(this.startData).getTime();//减去一天的时间代表可以选择同一天;
        //     }
        //   }
      }
    },
    components: {
      pagination,
    },
    mounted () {
      this.getStatistic()
    },
    methods: {
      queryData () {
        this.pageIndex = 0;
        this.getStatistic()
      },
      async getStatistic () {
        let StatisticObj = {};
        StatisticObj.orgName = this.companyName;
        StatisticObj.pageNum = this.pageIndex + 1;
        StatisticObj.pageSize = this.pageSize;
        if (this.task_status === 'year') {
          this.task_status_value = 1
        } else if (this.task_status === 'month') {
          this.task_status_value = 2
        } else if (this.task_status === 'date') {
          this.task_status_value = 3
        } else if (this.task_status === 'datetimerange') {
          this.task_status_value = 4
        }
        StatisticObj.dateType = this.task_status_value;
        if (this.task_status === 'datetimerange') {
          if (this.rangeData != null && this.rangeData[0] != undefined) {
            StatisticObj.endTime = this.rangeData[1];
            StatisticObj.startTime = this.rangeData[0];
          } else {
            StatisticObj.endTime = '';
            StatisticObj.startTime = '';
          }
        } else if (this.task_status === 'year') {
          if (this.startData !== '' && this.startData != null) {
            StatisticObj.endTime = '';
            StatisticObj.startTime = moment(this.startData).format('YYYY-MM-DD HH:mm:ss');
          } else {
            StatisticObj.endTime = '';
            StatisticObj.startTime = '';
          }
        } else if (this.task_status === 'date') {
          if (this.startData !== '' && this.startData != null) {
            StatisticObj.endTime = '';
            StatisticObj.startTime = moment(this.startData).format('YYYY-MM-DD HH:mm:ss');
          } else {
            StatisticObj.endTime = '';
            StatisticObj.startTime = '';
          }
        } else if (this.task_status === 'month') {
          if (this.startData !== '' && this.startData != null) {
            StatisticObj.endTime = '';
            StatisticObj.startTime = moment(this.startData).format('YYYY-MM-DD HH:mm:ss');
          } else {
            StatisticObj.endTime = '';
            StatisticObj.startTime = '';
          }
        } else {
          console.log(this.startData)
        }
        // return;
        let result = await this.request('/Statistics/queryStatisticsList', StatisticObj)
        if (result.data.list != null) {
          result.data.list.forEach((ele) => {
            ele.more_edit = true;
          })
        }
        this.statisticTotal = result.data.total
        this.statisticList = result.data.list
        this.pdf_tatol = result.data.monthPdfTotal
        this.all_tatol = result.data.monthTotal
        this.img_total = result.data.monthImgTotal
      },
      nodeIp_reg () {
        let ip = this.ip_address;
        if (!ip.match(/^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/)) {
          this.ip_address = ""
        }
      },
      async export2Excel () {
        let StatisticExcelObj = {};
        StatisticExcelObj.pageNum = this.pageIndex + 1;
        StatisticExcelObj.pageSize = this.statisticTotal;
        await this.getStatistic()
        require.ensure([], () => {
          const {export_json_to_excel} = require('../excel/Export2Excel');
          const tHeader = ['序号', '名称', 'IP地址', '累计处理（页）', 'PDF处理（页）', '图片处理（页）'];
          const filterVal = ['id', 'orgName', 'ipAdressStr', 'total', 'pdfTotal', 'imgTotal'];
          this.statisticList.forEach((ele, index) => {
            ele.id = index + 1;
          })
          let ipAdressArray = [];
          this.statisticList.forEach((element) => {
            element.ipList.forEach((ele) => {
              let ipAdress = ele.ipAddressStart + '-' + ele.ipAddressEnd
              ipAdressArray.push(ipAdress)
            })
            element.ipAdressStr = ipAdressArray.join('\n\r');
            ipAdressArray = [];
          })
          const list = this.statisticList
          const data = this.formatJson(filterVal, list);
          export_json_to_excel(tHeader, data, 'test' + moment(new Date()).format('YYYYMMDDHHmmss'));
        })
      },

      formatJson (filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      clearQuery () {
        this.startData = "";
        // this.endData = "";
        this.companyName = "";
        this.ip_address = "";
        this.task_status = "date";
      },
      click_more (value) {
        value.more_edit = !value.more_edit
      },
      //翻页
      async changePage (e) {
        this.pageIndex = e;
        this.getStatistic()
      },
      async changePageSize (e) {
        this.pageSize = e;
        this.pageIndex = 0
        this.getStatistic();
      },
      clearValue () {
        this.startData = ''
        this.rangeData = ''
      },
    }
  }
</script>
<style lang="scss">
  .ocr_statistics {
    .el-input__inner {
      height: 32px;
      border: 1px solid #ccc;
    }

    .el-select .el-input.is-focus .el-input__inner {
      border: 1px solid #ccc;
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
      font-size: 14px;

      .year {
        .date-time {
          width: 60%;
        }
      }

      .mounth_day {
        .date-time {
          width: 100%;

          .el-input__icon {
            position: absolute;
            right: 0;
            line-height: 30px;
          }

          .el-range__close-icon {
            right: 18px;
          }

        }
      }

      .el-icon-time:before {
        content: "\e78e";
      }

      .date-time {
        height: 30px;
        width: 170px;

        .el-icon-circle-close {
          position: absolute;
          right: 15px;
          line-height: 30px;
        }

        .el-input__inner {
          height: 30px;
          padding-left: 10px;
          border: 1px solid #ccc;
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
  .ocr_statistics {
    width: 100%;
    height: 100%;

    .statistics_title {
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

    .statistics_content {
      width: 100%;
      height: calc(100% - 41px);
      box-sizing: border-box;
      padding: 12px;

      .statistics_modules {
        width: 100%;
        height: 147px;
        /*background-color: lavender;*/
        position: relative;
        box-sizing: border-box;
        background-color: #e9f4f6;
        border: 1px solid #cae7f4;

        .statistics_module {
          display: inline-block;
          vertical-align: top;
          width: 33.33%;
          height: 127px;
          margin-top: 10px;
          background-repeat: no-repeat;
          background-position: 40px center;
          position: relative;
          background-size: 80px;

          .module-item {
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 150px);
            height: 100%;
            margin-left: 135px;
            box-sizing: border-box;
            font-size: 14px;

            .module-name {
              color: #333;
              margin: 25px 0 0 20px;
            }

            .module-value {
              margin: 10px 0 0 20px;
              font-size: 16px;

              .module_num {
                font-size: 48px;
                color: #0a59ab;
                margin-right: 5px;
                font-weight: bold;
              }
            }
          }

          .right_line::after {
            content: '';
            width: 0px;
            border: 1px solid #cae7f4;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            position: absolute;
            right: 0;
            top: 20px;
            height: 87px;
          }

        }

        .statistics_all {
          background-image: url("../assets/img/statistics/01.png");
        }

        .statistics_pdf {
          background-image: url("../assets/img/statistics/02.png");
        }

        .statistics_img {
          background-image: url("../assets/img/statistics/03.png");
        }
      }

      .statistics_search {
        height: 60px;
        width: 100%;
        position: relative;

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
          width: 12%;
          height: 30px;
          margin: 15px 10px 0 0;

          .ip_value {
            text-indent: 10px;
            outline: none;
            font-size: 14px;
            border: 1px solid #ccc;
            height: 26px;
            width: 100%;
            border-radius: 5px;
          }
        }

        .submission_time {
          width: 39%;
          height: 30px;
          margin-top: 15px;

          span {
            margin-top: 0;
          }

          .year, .mounth_day {
            width: calc(100% - 100px);
            display: inline-block;
            vertical-align: top;
            margin-top: 3px;
          }

        }

        .task_status {
          width: 12%;

          span {
            margin-top: 0;
          }

          .task_status_value {
            width: 100%;
            height: 30px;
            margin-top: 16px;
            border-radius: 5px;
          }
        }

        .search_buttons {
          width: 280px;
          position: absolute;
          right: 0;

          button {
            width: 80px;
            height: 32px;
            box-sizing: border-box;
            color: #fff;
            margin-top: 17px;
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
            background-size: 16px;
            background-image: url("../assets/img/statistics/search.png");
            margin: 0 10px;
          }

          .search_empty {
            background-color: #fd5e39;
          }

          .search_export {
            text-indent: 20px;
            background-position: 10px center;
            background-repeat: no-repeat;
            background-color: #09b53a;
            background-size: 18px;
            background-image: url("../assets/img/statistics/daochu.png");
            position: absolute;
            right: 0;
            top: 0;
          }
        }
      }

      .statistics_pageNum {
        height: 80px;
        width: 100%;
        position: relative;
        /*background-color: lavender;*/
      }

      .statistics_items {
        height: calc(100% - 274px);
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


            $arr: (80px, 220px, 320px, calc((100% - 620px) / 3), calc((100% - 620px) / 3), calc((100% - 620px) / 3));
            @for $i from 1 through length($arr) {
              &:nth-child(#{$i}) {
                width: nth($arr, $i);
              }
            }
          }

        }

        .tr {
          /*height: 75px;*/
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

            &:not(.first) {
              padding-left: 15px;
            }

            .tdData_more, .tdData_two {
              vertical-align: middle;

              span {
                display: inline-block;
                line-height: 20px;
                width: 100%;
                box-sizing: border-box;
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
              right: 5px;
              cursor: pointer;
            }


            &:nth-child(2) {
              color: #0066dc;
            }


            $arr: (80px, 220px, 320px, calc((100% - 620px) / 3), calc((100% - 620px) / 3), calc((100% - 620px) / 3));

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
