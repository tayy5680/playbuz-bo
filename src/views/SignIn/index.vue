<template lang="pug">
.SignIn
  el-form.form(:class="{'--is-mobile': isMobile}")
    h1 {{$t('登入')}}
    el-form-item
      el-input(
        :placeholder="$t('請輸入帳號')"
        v-model="form.account"
        @blur="v$.account.$touch"
        :class="{'--invalid': v$.account.$invalid && v$.account.$dirty}"
        tabindex="1"
      )
      FormErrors(:v$="v$.account")
    el-form-item
      el-input(
        :placeholder="$t('請輸入密碼')"
        v-model="form.password"
        @blur="v$.password.$touch"
        :class="{'--invalid': v$.password.$invalid && v$.password.$dirty}"
        show-password
        tabindex="2"
        @keyup.enter="onSubmit"
      )
      FormErrors(:v$="v$.password")
    el-form-item
      el-switch(
        v-model="form.isRemember"
        :active-text="$t('記住帳號')"
      )
    el-form-item
      el-button.button(
        type="primary"
        @click="onSubmit"
        :loading="isLoading"
        tabindex="3"
      ) {{$t('送出')}}
  .version
    span v{{ VERSION }}
</template>

<script>
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { testIsMobile } from '@/utils'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { useValidator, required } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import { VERSION } from '@/configs/version'
import i18n from '@/configs/locales'

export default {
  components: {
    FormErrors,
  },

  name: 'SignIn',

  setup () {
    const { global: { t } } = i18n
    const isMobile = testIsMobile()
    const store = useStore()
    const router = useRouter()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 登入表單相關
    const account = computed(() => store.state.account)
    const isRemember = computed(() => store.state.isRemember)
    const form = reactive({
      account: (isRemember.value && account.value) ? account.value : '',
      isRemember: isRemember.value ?? false,
      password: '',
    })
    const rules = {
      account: {
        required: required(),
      },
      password: {
        required: required(),
      },
    }
    const v$ = useValidator(rules, form)

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: t('內容輸入錯誤'), allowDuplicate: true })

      loadingCountPlus()
      try {
        await store.dispatch('signIn', form)
        await store.dispatch('getMenu')
        router.push({ name: 'dashboard' })
      } catch (err) {
        // 201 帳密錯誤(暫)
        if (err?.Code === '201') useNotice({ type: 'error', message: t('帳號或密碼錯誤'), allowDuplicate: true })
      } finally {
        loadingCountMinus()
      }
    }

    return {
      // data
      VERSION,
      isMobile,
      form,
      isLoading,
      // methods
      onSubmit,
      v$,
    }
  },
}
</script>

<style lang="scss" scoped>
@import '~/scss/variables.scss';

.SignIn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-position: center center;
  background-size: cover;
  background-color: $theme-main-color;
  background-image: url("../../../public/img/bg.jpg");
}

.form {
  box-sizing: border-box;
  padding: $main-padding;
  width: 100%;
  max-width: 520px !important;
  background-color: #fff;
  border: 1px solid $main-border-color;
  border-radius: $main-border-radius;

  &.--is-mobile {
    max-width: calc(100vw - #{$main-padding});
  }
}

.button {
  width: 100%;
}

.version {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: $main-padding;
  font-size: $content-font-size;
  color: #fff;
}
</style>
