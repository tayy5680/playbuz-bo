<template>
  <el-pagination class="Pagination" v-bind="$attrs" v-if="totalCount > 0" :current-page="innerPage" :page-size="count"
    :total="totalCount" :pageSizes="pageSizes" :layout="layout" @current-change="handleChangePage"
    @size-change="handleCountChange" />
</template>

<script>
import { defineComponent, nextTick, ref, watch } from 'vue'
import { ElPagination } from 'element-plus'

const calcTotalPage = (count, totalCount) => Math.ceil(totalCount / count)

export default defineComponent({
  components: {
    ElPagination,
  },

  props: {
    page: {
      required: true,
      type: Number,
    },
    count: {
      required: true,
      type: Number,
    },
    totalCount: {
      required: true,
      type: Number,
    },
    pageSizes: {
      default: () => [50, 100, 150, 200],
      validator: (value) => Array.isArray(value) && value.every(value => typeof value === 'number'),
    },
    layout: {
      default: 'sizes, prev, pager, next',
      type: String,
    },
  },

  emits: ['update:page', 'update:count', 'change'],

  setup (props, context) {
    const isSelfUpdating = ref(false)
    const innerPage = ref(props.page)
    watch(
      () => props.page,
      () => {
        if (props.page === innerPage.value) return

        isSelfUpdating.value = true
        innerPage.value = props.page
        nextTick(() => { isSelfUpdating.value = false })
      },
    )

    const handleChangePage = (page) => {
      if (isSelfUpdating.value) return

      context.emit('update:page', page)
      context.emit('change')
    }
    const handleCountChange = (count) => {
      context.emit('update:count', count)
      // 總頁數小於當前頁數，應該僅觸發一次 change，將由 handleChangePage 觸發
      if (props.page > calcTotalPage(count, props.totalCount)) return
      context.emit('change')
    }

    return {
      innerPage,
      handleChangePage,
      handleCountChange,
    }
  },
})
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

:deep(.el-pager .number.active) {
  color: $theme-reverse-main-color;
  background-color: $theme-main-color;
  border-radius: $main-border-radius;
}
</style>
