<template>
  <div class="textbox"
       contenteditable="true"
       @input="textboxInput"
       @blur="handleBlur"
       @focus="$emit('focus',$event)"
       :placeholder="initPlaceholder"
       ref="textbox">
  </div>
</template>

<script>
  export default {
    name: "VTextarea",
    data () {
      return {
        initPlaceholder: ''
      }
    },
    computed: {
      textbox () {
        return this.$refs.textbox;
      }
    },
    mounted () {
      this.textbox.innerHTML = this.value
      this.refreshPlaceholder()
    },
    watch: {
      value () {
        this.refreshPlaceholder()
        if (this.textbox.innerHTML !== this.value) {
          this.textbox.innerHTML = this.value
        }
      }
    },
    methods: {
      handleBlur (ev) {
        getSelection().removeAllRanges()
        this.$emit('blur', ev)
      },
      refreshPlaceholder () {
        if (this.value !== undefined && this.value.length) {
          this.initPlaceholder = ''
        } else {
          this.initPlaceholder = this.placeholder
        }
      },
      textboxInput () {
        this.$emit('input', this.textbox.innerHTML)
      }
    },
    props: {
      value: String,
      placeholder: String
    }
  }
</script>

<style scoped lang="scss">
  .textbox {
    background-color: white;
    outline: none;
    border: 1px solid #ccc;
    box-sizing: border-box;
    padding: 5px;

    &::before {
      content: attr(placeholder);
      color: #ccc;
      cursor: text;
      box-sizing: border-box;
    }

    &:focus {
      border-color: #ccc !important;
    }
  }
</style>
