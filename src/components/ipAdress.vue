<template>
  <div class="ipAdress">
    <ip-input-box @input="handleInput()" @blur="inputBlur" v-model='inputShowValue.ipAdress1'></ip-input-box>
    <i>~</i>
    <ip-input-box @input="handleInput()" @blur="inputBlur" v-model='inputShowValue.ipAdress2'></ip-input-box>
  </div>
</template>

<script>
  // import IpInput from './IpInput'
  import IpInputBox from './IpInputBox.vue'

  export default {
    name: "ipAdress",
    components: {IpInputBox},
    data () {
      return {
        inputValue: [{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}]
      }
    },
    methods: {
      handleInput () {
        let value1 = this.inputValue[0]
        let value2 = this.inputValue[1]
        let value3 = this.inputValue[2]
        let value4 = this.inputValue[3]
        let value5 = this.inputValue[4]
        // if (Number(value4.value) > Number(value5.value)) {
        //   value5.value = value4.value
        // }
        this.$emit('input', {
          ipAdress1: [value1.value, value2.value, value3.value, value4.value],
          ipAdress2: [value1.value, value2.value, value3.value, value5.value]
        })
      },
      inputBlur(index){
        if(index !== 3)return;
        let value1 = this.inputValue[0]
        let value2 = this.inputValue[1]
        let value3 = this.inputValue[2]
        let value4 = this.inputValue[3]
        let value5 = this.inputValue[4]
        if (Number(value4.value) > Number(value5.value)) {
          value5.value = value4.value
        }
        this.$emit('input', {
          ipAdress1: [value1.value, value2.value, value3.value, value4.value],
          ipAdress2: [value1.value, value2.value, value3.value, value5.value]
        })
      }
    },
    computed: {
      inputShowValue () {
        let value1 = this.inputValue[0]
        let value2 = this.inputValue[1]
        let value3 = this.inputValue[2]
        let value4 = this.inputValue[3]
        let value5 = this.inputValue[4]
        return {
          ipAdress1: [value1, value2, value3, value4],
          ipAdress2: [value1, value2, value3, value5]
        }
      }
    },
    props: {
      value: {
        type: Object,
        default: () => {
          return {
            ipAdress1: ['', '', '', ''],
            ipAdress2: ['', '', '', '']
          }
        }
      }
    },
    watch: {
      value () {
        this.inputValue[0].value = this.value.ipAdress1[0]
        this.inputValue[1].value = this.value.ipAdress1[1]
        this.inputValue[2].value = this.value.ipAdress1[2]
        this.inputValue[3].value = this.value.ipAdress1[3]
        this.inputValue[4].value = this.value.ipAdress2[3]
      }
    },
    mounted () {
      this.inputValue[0].value = this.value.ipAdress1[0]
      this.inputValue[1].value = this.value.ipAdress1[1]
      this.inputValue[2].value = this.value.ipAdress1[2]
      this.inputValue[3].value = this.value.ipAdress1[3]
      this.inputValue[4].value = this.value.ipAdress2[3]
    }
  }
</script>

<style scoped lang="scss">
  .ipAdress {
    width: calc(100% - 135px);
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    i{
      display: inline-block;
      height: 100%;
      /*margin: 0 10px;*/
      margin-right:4px;
    }
  }
</style>
