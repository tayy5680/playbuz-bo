<template>
  <div class="Menu__mask" v-if="isMenuOpen" @click="triggerMenuClose" />
  <div class="Menu" :class="{ '--is-mobile': isMobile, '--is-open': isMenuOpen }">
    <div class="title">
      <router-link class="title__text" :to="{ name: 'dashboard' }">
        <img :src="require('./images/logo.svg')" width="40" height="40" />
        <div class="title__text__text">Back Office</div>
      </router-link>
    </div>
    <el-menu class="el-menu" background-color="#545c64" text-color="#ebeef5" active-text-color="#fff" router :default-active="nowPath">
      <template v-for="(item, index) of menu" :key="index">
        <el-submenu :index="`${item.code}`">
          <template #title>
            <i :class="item.icon" />
            <span>{{ $t(item.name) }}</span>
          </template>
          <template v-for="(children, childIndex) of item.children" :key="childIndex">
            <el-menu-item :index="children.path" :class="{ 'el-menu-item-active': children.path === nowPath }" @click="triggerMenuClose">
              {{ $t(children.name) }}
            </el-menu-item>
          </template>
        </el-submenu>
      </template>
    </el-menu>
    <div class="version" :class="{ '--is-mobile': isMobile }">
      <span>v{{ VERSION }}</span>
    </div>
  </div>
</template>
<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { VERSION } from '@/configs/version'
import { testIsMobile } from '@/utils'

export default {
  name: 'Menu',

  setup () {
    const isMobile = testIsMobile()

    const store = useStore()
    const menu = computed(() => store.state.menu)
    const route = useRoute()
    const nowPath = computed(() => {
      const pathArr = route.path.split('/')
      if (pathArr.length > 2) return `/${pathArr[1]}/${pathArr[2]}`
      return ''
    })

    const isMenuOpen = computed(() => store.state.isMenuOpen)
    const triggerMenuClose = () => {
      store.commit('SET_IS_MENU_OPEN', false)
    }
    triggerMenuClose()

    return {
      // data
      VERSION,
      isMobile,
      isMenuOpen,
      menu,
      nowPath,
      // methods
      triggerMenuClose,
    }
  },
}
</script>
<style lang="scss" scoped>
@import '~/scss/variables.scss';

$base-z-index: 2;

.Menu {
  position: relative;
  z-index: $base-z-index + 1;
  overflow-y: scroll;
  width: $menu-width;
  height: 100vh;
  background-position: center center;
  background-size: cover;
  background-color: #545c64;
  transition: left .5s;
  background-image: url("images/bg.jpg");

  &.--is-mobile {
    position: fixed;
    left: -$menu-width;
    height: -webkit-fill-available;

    &.--is-open {
      left: 0;
    }
  }
}

.Menu__mask {
  position: fixed;
  z-index: $base-z-index;
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;
  background-color: rgba(#000, .3);
}

.el-menu {
  border-right: none;
  z-index: $base-z-index + 2;
}

.el-menu-item-active {
  background-color: $theme-main-color !important;
}

.el-menu-item {
  padding: 15px 10px 15px 0;
  height: auto;
  word-break: normal;
  white-space: break-spaces;
  line-height: 18px;
}

.el-submenu__title span {
  margin: 20px 10px 20px 0;
  word-break: normal;
  white-space: break-spaces;
  line-height: 18px;
}

.title {
  box-sizing: border-box;
  display: block;
  padding: $main-padding;
  width: 100%;
}

.title__text {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-decoration: none;
  color: #fff;
}

.title__text__text {
  margin-left: $main-padding;
}

.version {
  position: absolute;
  right: $main-padding;
  bottom: $main-padding;
  font-size: $content-font-size;
  color: #fff;

  &.--is-mobile {
    right: $main-padding/2;
    bottom: $main-padding/2;
  }
}
</style>
<style lang="scss">
.el-submenu__title {
  display: flex;
  align-items: center;
  height: auto;
}
</style>
