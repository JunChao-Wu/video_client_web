<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import LoginDialog from "@/components/login/LoginDialog.vue";
import { localCache } from '@/utils/cache/cache';


const routers = [
  { path: '/', name: 'Home', },
];
const showUserOption = ref(false)
const _user = localCache.getSubCache('user');
const userName = ref('')
const loginDialog = ref(null)
function switchDialog() {
  const _user = localCache.getCache('user');
  if (_user && _user.id) {
    return;
  }
  (loginDialog.value as any).switchDialog()
}

function hadnleShowOptions(isShow: boolean) {
  showUserOption.value = isShow
}

watch(_user, (newVal) => {
  userName.value = newVal && newVal.id && newVal.userName || '';
})



</script>
<template>
  <header>
    <div class="nav-container">
      <div class="nav-left">
        <el-menu class="el-menu" mode="horizontal">
          <el-menu-item v-for="(route, index) in routers" :index="index + ''" :key="index">
            <RouterLink :to="route.path" active-class="router-line-active">
              {{ route.name }}
            </RouterLink>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="nav-right" @mouseenter="hadnleShowOptions(true)" @mouseleave="hadnleShowOptions(false)">
        <div class="user-info-icon-main" :user-name="userName">
          <el-avatar :icon="UserFilled" class="user-info-icon" @click="switchDialog" />
        </div>
        <div v-if="userName" class="user-options-container">
          <ul v-show="showUserOption" class="user-options-main" @click="hadnleShowOptions(false)">
            <li class="user-options-item">
              <RouterLink to="/my_series" active-class="router-line-active" style="display: block;width: 100%;">
                <i class="user-options-name">my_series</i>
              </RouterLink>
            </li>
            <li class="user-options-item">
              <RouterLink to="/examine" active-class="router-line-active" style="display: block;width: 100%;">
                <i class="user-options-name">examine</i>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <LoginDialog ref="loginDialog" />
  </header>

</template>
<style lang="scss" scoped>
header {
  .nav-container {
    background-color: var(--el-menu-bg-color);
    padding-left: 2rem;
    padding-right: 2rem;
    display: flex;

    .nav-left {
      width: 100%;

      .el-menu {
        border: 0;

        .el-menu-item {
          transition: none;
        }

        .is-active {
          border-bottom: 0;
        }

        .router-line-active {
          display: block;
          border-bottom: 2px solid var(--el-menu-active-color);
          color: var(--el-menu-active-color);
        }
      }
    }

    .nav-right {
      display: flex;
      padding: 0 var(--el-menu-base-level-padding);
      align-items: center;
      position: relative;

      .user-info-icon-main {
        .user-info-icon {
          cursor: pointer;
        }

        &::before {
          content: attr(user-name) "";
          position: absolute;
          top: 1.25rem;
          right: 4rem;
          opacity: 0.5;
        }
      }

      .user-options-container {
        z-index: 99;
        position: absolute;
        top: 3.5rem;
        right: 0;

        .user-options-main {
          padding: 10px 10px;
          border-radius: 10px;
          background-color: #fff;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);

        }

        .user-options-item {
          cursor: pointer;
          border-radius: 5px;
          width: 200px;
          height: 3rem;
          line-height: 3rem;
          padding-left: 20px;
          background-color: #fff;
          color: var(--normal-c-font-dark);

          &:hover {
            background-color: var(--normal-c-font-gray);
            // opacity: 0.75;
          }

          .user-options-name {
            font-style: normal;
            color: var(--normal-c-font-dark);
          }
        }
      }
    }
  }
}
</style>
