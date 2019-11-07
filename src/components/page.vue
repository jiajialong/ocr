<template>
  <div class="pagination-box">
    <div class="pagonation_left">
      <div class="pagonation_select">
        每页<select class="page_limit" :value="pageSize" @change="change_limit">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </select>条
      </div>
      <div class="pagonation_msg">共{{total}}条&nbsp;{{totalPageCount}}页</div>
    </div>
    <div class="pagonation_right">
      <div class="item first" :class="{disabled:!total||pageIndex===0}" @click="changePageIndex(0)">首页</div>
      <div class="item prev" :class="{disabled:!total||pageIndex===0}" @click="changePageIndex(pageIndex-1)"></div>
      <div class="item" :class="{curr:0===pageIndex}" v-show="total" @click="changePageIndex(0)">1</div>
      <div class="item prev-more" v-show="showPrevMore" @click="changePageIndex(pageIndex-5)"></div>
      <div class="item" :class="{curr:index===pageIndex}"
           @click="changePageIndex(index)"
           v-for="index in showList" :key="index">
        {{index+1}}
      </div>
      <div class="item next-more" v-show="showNextMore" @click="changePageIndex(pageIndex+5)"></div>
      <div class="item" v-show="totalPageCount>1"
           @click="changePageIndex(totalPageCount-1)"
           :class="{curr:totalPageCount-1===pageIndex}">{{totalPageCount}}
      </div>
      <div class="item next" :class="{disabled:!total||pageIndex===totalPageCount-1}"
           @click="changePageIndex(pageIndex+1)"></div>
      <div class="item last" :class="{disabled:!total||pageIndex===totalPageCount-1}"
           @click="changePageIndex(totalPageCount-1)">尾页</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Pagination',
    props: {
      pageIndex: {
        type: Number,
        default: 0
      },
      pageSize: {
        type: Number,
        default: 10
      },
      total: {
        type: Number,
        required: true
      }
    },
    data () {
      return {
        pagerCount: 5
      }
    },
    computed: {
      totalPageCount () {
        return Math.ceil(this.total / this.pageSize)
      },
      showPrevMore () {
        const halfPagerCount = (this.pagerCount - 1) / 2
        if (this.totalPageCount - 2 > this.pagerCount) {
          if (this.pageIndex > this.pagerCount - halfPagerCount) {
            return true
          }
        }
        return false
      },
      showNextMore () {
        const halfPagerCount = (this.pagerCount - 1) / 2
        if (this.totalPageCount - 2 > this.pagerCount) {
          if (this.pageIndex < this.totalPageCount - 2 - halfPagerCount) {
            return true
          }
        }
        return false
      },
      showList () {
        const showList = []
        const pagerCount = this.pagerCount

        const pageIndex = this.pageIndex

        let start = this.totalPageCount - pagerCount - 1

        if (this.showPrevMore && !this.showNextMore) {
          for (let i = start; i < this.totalPageCount - 1; i++) {
            showList.push(i)
          }
        } else if (!this.showPrevMore && this.showNextMore) {
          for (let i = 1; i <= pagerCount; i++) {
            showList.push(i)
          }
        } else if (this.showPrevMore && this.showNextMore) {
          const offset = Math.floor(pagerCount / 2)
          for (let i = pageIndex - offset; i <= pageIndex + offset; i++) {
            showList.push(i)
          }
        } else {
          for (let i = 1; i < this.totalPageCount - 1; i++) {
            showList.push(i)
          }
        }
        return showList
      }
    },
    methods: {
      changePageIndex (pageIndex) {
        let validPageIndex = this.getValidPageIndex(pageIndex)
        this.$emit('update:page-index', validPageIndex)
        this.$emit('page', validPageIndex)
      },
      change_limit(evt){
        let pageSize = parseInt(evt.target.value)
        this.$emit('update:page-size',pageSize )
        this.$emit('limit',pageSize )
      },
      getValidPageIndex (pageIndex) {
        if (pageIndex < 0) {
          pageIndex = 0
        } else if (pageIndex > this.totalPageCount - 1) pageIndex = this.totalPageCount - 1
        return pageIndex
      }
    }
  }
</script>

<style scoped lang="scss">
  .pagination-box {
    width: 100%;
    height: 40px;
    position: absolute;
    bottom: 8px;
    box-sizing: border-box;
    padding: 10px;
    font-size: 14px;
    .pagonation_left {
      position: absolute;
      left: 10px;
      bottom: 0;

      .pagonation_select {
        display: inline-block;
        vertical-align: top;
        margin-right: 10px;

        .page_limit {
          margin: 0 10px;
          border-radius: 2px;
          border: 1px solid #ccc;
        }
      }
      .pagonation_msg{
        display: inline-block;
        vertical-align: top;
      }
    }

    .pagonation_right {
      position: absolute;
      right: 0;
      .item {
        display: inline-block;
        height: 24px;
        line-height: 22px;
        border: 1px solid #cccccc;
        width: 24px;
        font-size: 12px;
        vertical-align: top;
        text-align: center;
        border-radius: 2px;
        margin-left: 6px;
        color: #000000;
        box-sizing: border-box;
        font-family: Consolas;
        cursor: default;

        &:nth-child(1) {
          margin-left: 0;
        }

        &.first, &.last {
          width: 50px;
        }

        &.prev {
          &::after {
            content: '<';
          }
        }

        &.next {
          &::after {
            content: '>';
          }
        }

        &:hover {
          /*background-color: #1579e3;*/
          border-color: #1579e3;
          color: #1579e3;
        }

        &.curr {
          background-color: #1579e3;
          color: #fff;
        }

        &.··· {
          pointer-events: none;
          border-color: transparent;
        }

        &.prev-more {
          border-color: transparent;

          &::after {
            content: '···';
          }

          &:hover {
            &::after {
              content: '<<';
            }
          }
        }

        &.next-more {
          border-color: transparent;

          &::after {
            content: '···';
          }

          &:hover {
            &::after {
              content: '>>';
            }
          }
        }

        &.disabled {
          pointer-events: none;
          background-color: #f7f7f7;
          border-color: #f7f7f7;
          color: #d0d0d0;
        }
      }
    }
  }
</style>
