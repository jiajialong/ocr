import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 登录
    isRemember: false,
    node_checked: '',

    isShow_must: false,
    eidt_index: "",
    // colonyList:[],
    ocr_td: [{
      id: '1',
      add_nodeName: "11",
      add_nodeIp: "11.2.3.6",
      add_nodeMargin: "11",
      add_nodeHandle: "11",
      add_status: 'being'
    }, {
      id: '2',
      add_nodeName: "22",
      add_nodeIp: "22.2.3.6",
      add_nodeMargin: "22",
      add_nodeHandle: "22",
      add_status: 'failed'
    }, {
      id: '3',
      add_nodeName: "33",
      add_nodeIp: "33.2.3.6",
      add_nodeMargin: "33",
      add_nodeHandle: "33",
      add_status: 'prohibit'
    }, {
      id: '4',
      add_nodeName: "44",
      add_nodeIp: "44.2.3.6",
      add_nodeMargin: "44",
      add_nodeHandle: "44",
      add_status: 'loading',
    }]
  },
  mutations: {


    changeIsRemember (state, data) {
      if (data != undefined) {
        state.isRemember = data.value
      } else {
        state.isRemember = !state.isRemember
      }
    },
    changeNodeChecked (state, data) {
      if (data != undefined) {
        state.node_checked = data.value
      } else {
        state.node_checked = !state.node_checked
      }
    }
  },
  actions: {
    changeIsRemember (ctx, data) {
      ctx.commit('changeIsRemember', data)
    },
    changeNodeChecked (ctx, data) {
      ctx.commit('changeNodeChecked', data)
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})
