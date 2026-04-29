<template>
  <ol class="FormErrors" v-if="v$.$invalid && v$.$dirty">
    <template v-for="item of validatorKeys" :key="item">
      <li v-if="v$[item] && v$[item].$invalid">
        {{ $t(v$[item].$message) }}
      </li>
    </template>
  </ol>
</template>
<script>
import { computed } from 'vue'

// 排除$ 只留下頁面內rules中的需驗證內容
function getValidatorKeys (validation) {
  return Object.keys(validation)
    .filter(key => key.startsWith('$') === false)
}

export default {
  props: {
    v$: {
      required: true,
      type: Object,
    },
  },

  setup (props) {
    const validatorKeys = computed(() => {
      return getValidatorKeys(props.v$)
    })
    return {
      validatorKeys,
    }
  },
}

</script>
<style lang="scss" scoped>
@import "~/scss/variables.scss";

.FormErrors {
  display: flex;
  margin: 0;
  padding: 0;
  padding-left: $base-font-size;
  width: 100%;
  font-size: $base-font-size * .75;
  flex-direction: column;
  text-align: left;
  line-height: 1.5;
  color: $theme-danger-color;
  list-style: disc;
}
</style>
