<template>
  <div class="ip-input-out-box">
    <div class="ip-input-inner-box"  v-for="(item,index) in value" :key="index">
      <input class="input-box"
             type="text"
             v-model="item.value"
             @input="handleInput(item)"
             ref="ipInput"
             @blur='$emit("blur",index)'
             @keydown="limitInputText"
             @keyup="handleKeyup(index,$event)"
             />
      <div class="spot"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "IpInputBox",
    props: {value: Array},
    methods: {
      handleInput (item) {
        let val = item.value;
        //当输入空格时，赋值为空
        val = val.trim();
        val = parseInt(val, 10);
        if (isNaN(val)) {
          val = ""
        } else {
          val = val < 0 ? 0 : val;
          val = val > 255 ? 255 : val;
        }
        item.value = val;
        this.$emit('input', this.value)
      },
      limitInputText (e) {
        if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
          e.preventDefault()
        }
      },
      handleKeyup (index,event) {
        let self = this;
        let e = event || window.event;
        if (e.key === 'Enter') {
          if (index == 3) {
            console.log('this is the last')
          } else {
            self.$refs.ipInput[index + 1].focus()
          }
        } else if (e.key === 'ArrowRight') {
          if (index == 3) {
            console.log('this is the last')
          } else {
            self.$refs.ipInput[index + 1].focus()
          }
        } else if (e.key === 'ArrowLeft') {
          if (index == 0) {
            console.log('this is the last')
          } else {
            self.$refs.ipInput[index - 1].focus();
          }
        } else if (e.key === '.') {
          if (index == 3) {
            console.log('this is the last')
          } else {
            self.$refs.ipInput[index + 1].focus();
          }
        }else if(e.key === 'Backspace'){
          if (index == 0) {
            console.log('this is the first')
          }
        }
      },
    }
  }
</script>

<style scoped lang="scss">
  .ip-input-out-box {
    display: inline-block;
    width: 47%;
    height: 38px;
    border: 1px solid #ccc;
    vertical-align: middle;
    .ip-input-inner-box{
      position: relative;
      display: inline-block;
      width: calc(100% / 4);
      height: 38px;
      .input-box {
        box-sizing: border-box;
        outline: none;
        width: 100%;
        text-align: center;
        height: 100%;
        border: gainsboro;
        display: inline-block;
        vertical-align: top;
      }
      .spot {
        position: absolute;
        bottom: 2px;
        right: 0;
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background-color: #999;
      }
      &:last-child div {
        display: none;
      }
    }

  }
</style>
