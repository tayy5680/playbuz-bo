<template>
  <div class="Header" :class="{ '--is-mobile': isMobile }">
    <div class="left" :class="{ '--is-mobile': isMobile }">
      <breadcrumb />
    </div>
    <div class="right" v-loading="isLoading" :class="{ '--is-mobile': isMobile }">
      <div class="menu-button" v-if="isMobile" @click="triggerMenuOpen">
        <Expand />
      </div>
      <div class="account">
        <div class="account__text">
          {{ account }}
        </div>
        <div class="account__ad-type">
          {{ formatUser(adID) }}
        </div>
      </div>
      <el-dropdown trigger="click">
        <el-avatar class="avatar" size="small" icon="el-icon-s-operation" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="() => isDialogShow = true" icon="el-icon-key">
              {{ $t('重設密碼') }}
            </el-dropdown-item>
            <el-dropdown-item @click="() => isLanguageDialogDisplay = true" icon="el-icon-key">
              {{ $t('設定語系') }}
            </el-dropdown-item>
            <el-dropdown-item @click="signOut()" icon="el-icon-switch-button">
              {{ $t('登出') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <PasswordChange :isShow="isDialogShow" @close="() => isDialogShow = false" @success="signOut()" />
    <LanguageChange :isShow="isLanguageDialogDisplay" @close="() => isLanguageDialogDisplay = false" />
  </div>
</template>
<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Expand } from '@element-plus/icons'
import { loadingCounter } from '@/utils/loading-counter'
import breadcrumb from './breadcrumb'
import PasswordChange from './PasswordChange'
import LanguageChange from './LanguageChange'
import { testIsMobile } from '@/utils'
import { createFormatter } from '@/utils/formatters'
import { AD_TYPE_LIST } from '@/configs'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Header',

  components: {
    breadcrumb,
    PasswordChange,
    LanguageChange,
    Expand,
  },

  setup () {
    const isMobile = testIsMobile()
    const { t } = useI18n()

    const store = useStore()
    const router = useRouter()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    const getAdvertiserInfo = () => {
      loadingCountPlus()
      store.dispatch('getAdvertiserInfo')
        .finally(() => {
          loadingCountMinus()
        })
    }
    getAdvertiserInfo()

    const signOut = () => {
      loadingCountPlus()
      store.dispatch('signOut')
        .finally(() => {
          router.push({ name: 'SignIn' })
          loadingCountMinus()
        })
    }

    const triggerMenuOpen = () => {
      store.commit('SET_IS_MENU_OPEN', true)
    }

    const account = computed(() => {
      let res = store.state.account
      if (store.state.isTrial) res = `${res} (${t('試用')})`
      return res
    })

    const adID = computed(() => {
      return store.state.advertisersData.AdID
    })

    const isDialogShow = ref(false)
    const isLanguageDialogDisplay = ref(false)

    const formatUser = (id) => {
      const target = AD_TYPE_LIST.find(item => item.id === id)
      return target ? t(target.name) : id
    }

    return {
      // data
      isMobile,
      isLoading,
      account,
      adID,
      isDialogShow,
      isLanguageDialogDisplay,
      // methods
      signOut,
      adTypeFormatter: createFormatter(AD_TYPE_LIST, 'id', 'name'),
      triggerMenuOpen,
      formatUser,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

.Header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;

  &.--is-mobile {
    align-items: flex-end;
    height: auto;
    flex-direction: column-reverse;
  }
}

.right {
  position: relative;
  display: flex;
  align-items: center;

  &.--is-mobile {
    align-items: right;
    justify-content: flex-end;
    width: 100%;
    margin-bottom: $main-padding/2;
  }
}

.left {
  &.--is-mobile {
    width: 100%;
    font-size: $content-font-size;
    text-align: center;
  }
}

.account {
  display: inline-flex;
  flex-direction: column;
  font-size: $content-font-size;
  color: #606266;
  line-height: 1;
}

.account__text,
.account__ad-type {
  text-align: right;
}

.avatar {
  cursor: pointer;
  margin-left: 10px;
}

.menu-button {
  position: absolute;
  left: $main-padding/2;
  width: 28px;
  color: #606266;
}
</style>
