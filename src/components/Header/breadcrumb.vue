<template>
  <div class="breadcrumb">
    <template v-if="pathArr.length > 2">
      <div class="main">
        {{ $t(main) }}
      </div>
      <template v-if="sub">
        <i class="el-icon-arrow-right separate" />
        <div class="sub">
          {{ $t(sub) }}
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

  export default {
    setup () {
      const route = useRoute()
      const store = useStore()
      const pathArr = computed(() => route.path.split('/'))
      const menu = computed(() => store.state.menu)
      const mainItem = computed(() => {
        const name = pathArr.value?.[1] ?? ''
        const target = menu.value.find(item => item.path === name)
        return target
      })
      const main = computed(() => {
        return mainItem.value?.name ?? ''
      })
      const sub = computed(() => {
        const target = mainItem.value?.children.find(item => item.path === route.path)
        return target?.name ?? ''
      })
      return {
        pathArr,
        main,
        sub,
        menu,
      }
    },
  }
  </script>
  <style lang="scss" scoped>
  @import '~/scss/variables.scss';

  .main {
    display: inline;
  }

  .sub {
    display: inline;
  }

  .separate {
    margin: 0 $base-font-size/2;
  }
  </style>
