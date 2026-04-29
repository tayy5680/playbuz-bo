<template lang="pug">
.Breadcrumb(v-if="pathArr.length > 0")
  CircleCloseFilled.close-button(@click="queryChange()")
  span.text {{$t('當前查詢')}}:
  .item-block(v-for="(item, index) in pathArr" :class="{'--is-mobile': isMobile}")
    i.el-icon-arrow-right.separate(v-if="index > 0")
    span.item(
      @click="queryChange(item.MemberID)"
    ) {{ item.MemberAccount }}
</template>
<script>
import { CircleCloseFilled } from '@element-plus/icons'
import { testIsMobile } from '@/utils'

export default {
  props: {
    pathArr: {
      required: true,
      type: Array,
    },
  },

  emits: ['queryChange'],

  components: {
    CircleCloseFilled,
  },

  setup (props, context) {
    const isMobile = testIsMobile()

    const queryChange = (memberId) => {
      context.emit('queryChange', memberId)
    }

    return {
      // data
      isMobile,
      // methods
      queryChange,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

.Breadcrumb {
  font-size: $content-font-size;
  margin-bottom: $content-font-size/2;

  & .item-block:nth-of-type(3).--is-mobile {
    margin-left: $content-font-size;
  }
}

.separate {
  margin: 0 $content-font-size/2;
}

.item-block {
  display: inline;

  &.--is-mobile {
    display: block;
    margin-top: $content-font-size/2;
  }
}

.item {
  cursor: pointer;
  text-decoration: underline;
}

.text {
  margin-right: $content-font-size/2;
}

.close-button {
  margin-right: $content-font-size/4;
  width: $content-font-size;
  height: $content-font-size;
  vertical-align: top;
  cursor: pointer;
}
</style>
