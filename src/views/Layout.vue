<template lang="pug">
el-container
  el-aside
    Menu
  el-container.container(:class="{'--is-ios': isiOS}")
    el-header.header(:class="{'--is-mobile': isMobile}")
      Header
    el-main.main
      router-view
</template>
<script>
import Menu from '@/components/Menu/index'
import Header from '@/components/Header/index'
import { testIsMobile, testIsiOS } from '@/utils'

export default {
  name: 'Layout',
  components: {
    Menu,
    Header,
  },
  setup () {
    const isMobile = testIsMobile()
    const isiOS = testIsiOS()

    return {
      isMobile,
      isiOS,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

.container {
  position: relative;
  height: 100vh;

  &.--is-ios {
    height: -webkit-fill-available;
  }
}

.main {
  padding: $main-padding;
}

.header {
  border-bottom: 1px solid #dcdfe6;
  padding: 0 $main-padding;

  &.--is-mobile {
    padding: $main-padding/2;
  }
}
</style>
