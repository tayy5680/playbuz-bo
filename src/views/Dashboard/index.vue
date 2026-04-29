<template lang="pug">
.Welcome
  el-form(inline label-position="left" size="small")
    el-form-item(:label="$t('起始時間')")
        el-date-picker(
          type="datetime"
          v-model="searchData.sDate"
          :disabled-date="getSDisabledDate"
          :clearable="false"
        )
    el-form-item(:label="$t('結束時間')")
      el-date-picker(
        type="datetime"
        v-model="searchData.eDate"
        :disabled-date="getEDisabledDate"
        :clearable="false"
      )
    el-form-item
      el-button(
        type="primary"
        @click="handleFetch"
      ) {{ $t('搜尋')}}
    el-form-item
      el-button(
        @click="initSearchData"
      ) {{ $t('清除條件')}}
  el-row.row(:gutter="12" :class="{'--is-mobile': isMobile}")
      el-col(:span="isMobile ? 24 : 8")
        el-card(shadow="hover")
          template(#header)
            .card-header
              span {{ $t('廣告加盟商即時資料')}}
          vue3-chart-js(
            :key="chartData11"
            type="bar"
            :data="chartData11"
            :options="chartOptions"
          )
      el-col(:span="isMobile ? 24 : 16")
        el-card(shadow="hover" v-if="isTrial")
          template(#header)
            .card-header
              span {{ `${$t('廣告加盟商統計資料')}(${$t('演示用')})` }}
          vue3-chart-js(
            :key="chartData12"
            type="line"
            :data="chartData12"
            :options="chartOptions"
          )
  el-row.row(:gutter="12" :class="{'--is-mobile': isMobile}")
    el-col(:span="isMobile ? 24 : 8")
      el-card(shadow="hover")
        template(#header)
          .card-header
            span {{ $t('會員即時資料')}}
        vue3-chart-js(
          :key="chartData21"
          type="bar"
          :data="chartData21"
          :options="chartOptions"
        )
    el-col(:span="isMobile ? 24 : 16")
      el-card(shadow="hover" v-if="isTrial")
        template(#header)
          .card-header
            span {{ `${$t('會員統計資料')}(${$t('演示用')})` }}
        vue3-chart-js(
          :key="chartData22"
          type="line"
          :data="chartData22"
          :options="chartOptions"
        )
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Vue3ChartJs from '@j-t-mcc/vue3-chartjs'
import dayjs from 'dayjs'
import { testIsMobile } from '@/utils'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    Vue3ChartJs,
  },

  setup () {
    const { t } = useI18n()
    const lang = computed(() => store.state.lang)
    const isMobile = testIsMobile()
    // 搜尋表單相關
    const searchData = ref({})
    const initSearchData = () => {
      searchData.value = {
        sDate: dayjs().subtract(30, 'day').toISOString(),
        eDate: dayjs().endOf('day').toDate().toISOString(),
      }
    }
    const searchDataDateRangeLebels = computed(() => {
      const diffDays = dayjs(searchData.value.eDate).diff(dayjs(searchData.value.sDate), 'day')
      const resArr = []
      for (let index = 0; index < diffDays; index++) {
        resArr.push(dayjs(searchData.value.sDate).add(index, 'day').format('YYYY-MM-DD'))
      }
      return resArr
    })
    initSearchData()
    // 設定禁用日期 禁用今天到dayRange前之外的日期
    const dayRange = 62
    const getSDisabledDate = (date) => {
      return SDisabledDate(date, searchData.value.eDate, dayRange)
    }
    const getEDisabledDate = (date) => {
      return EDisabledDate(date, searchData.value.sDate, dayRange)
    }
    // 呈現資料相關
    // TODO
    const handleFetch = async () => {}
    const store = useStore()
    const isTrial = computed(() => store.state.isTrial)
    const advertiserData = computed(() => {
      return {
        AdCount: store.state.advertisersData.AdCount,
        SecondaryAdCount: store.state.advertisersData.SecondaryAdCount,
        MemberCount: store.state.advertisersData.MemberCount,
        SecondaryMemberCount: store.state.advertisersData.SecondaryMemberCount,
      }
    })

    const chartData11 = computed(() => {
      return {
        lang: lang.value,
        labels: [
          t('直屬數'),
          t('全部總數'),
        ],
        datasets: [{
          label: '',
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          data: [
            advertiserData.value.SecondaryAdCount,
            advertiserData.value.AdCount,
          ],
        }],
      }
    })
    // 直屬註冊數
    const chartData12FakeData1 = computed(() => {
      const res = []
      searchDataDateRangeLebels.value.forEach(() => res.push(Math.floor(Math.random() * 20 + 1)))
      return res
    })
    // 全部註冊總數
    const chartData12FakeData2 = computed(() => {
      const res = []
      searchDataDateRangeLebels.value.forEach(() => res.push(Math.floor(Math.random() * 100 + 1)))
      return res
    })
    const chartData12 = computed(() => {
      return {
        lang: lang.value,
        labels: searchDataDateRangeLebels.value,
        datasets: [
          {
            label: t('直屬註冊數'),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 0.6)',
            ],
            data: chartData12FakeData1.value,
          }, {
            label: t('全部註冊總數'),
            backgroundColor: [
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 159, 64, 0.6)',
            ],
            data: chartData12FakeData2.value,
          },
        ],
      }
    })
    const chartData21 = computed(() => {
      return {
        lang: lang.value,
        labels: [
          t('直屬數'),
          t('全部總數'),
        ],
        datasets: [{
          label: '',
          backgroundColor: [
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          data: [
            advertiserData.value.SecondaryMemberCount,
            advertiserData.value.MemberCount,
          ],
        }],
      }
    })
    // 訪客註冊數
    const chartData22FakeData1 = computed(() => {
      const res = []
      searchDataDateRangeLebels.value.forEach(() => res.push(Math.floor(Math.random() * 100 + 1)))
      return res
    })
    // 訪客轉會員數
    const chartData22FakeData2 = computed(() => {
      const res = []
      searchDataDateRangeLebels.value.forEach(() => res.push(Math.floor(Math.random() * 20 + 1)))
      return res
    })
    const chartData22 = computed(() => {
      return {
      lang: lang.value,
      labels: searchDataDateRangeLebels.value,
      datasets: [
        {
          label: t('訪客註冊數'),
          backgroundColor: [
            'rgba(255, 205, 86, 0.6)',
          ],
          borderColor: [
            'rgba(255, 205, 86, 0.6)',
          ],
          data: chartData22FakeData1.value,
        }, {
          label: t('訪客轉會員數'),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 0.6)',
          ],
          data: chartData22FakeData2.value,
        },
      ],
    }
    })
    const chartOptions = ref({
      plugins: {
        legend: {
          display: false,
        },
      },
    })
    return {
      // data
      isMobile,
      isTrial,
      chartData11,
      chartData12,
      chartData21,
      chartData22,
      chartOptions,
      searchData,
      // methods
      handleFetch,
      initSearchData,
      getSDisabledDate,
      getEDisabledDate,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

.Welcome {
  min-height: calc(100vh - #{$header-height} - #{$main-padding} * 2);
}

.row {
  margin-bottom: $main-padding;

  &.--is-mobile {
    margin-bottom: $main-padding/2;

    .el-col {
      margin-bottom: $main-padding/2;
    }
  }
}
</style>
