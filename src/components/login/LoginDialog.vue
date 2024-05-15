<template>
  <div id="login-container" v-if="showLogin" @click.self="switchDialog">
    <div class="login-dialog">
      <div class="form-container">
        <form>
          <div class="form-item">
            <!-- 占用格 -->
          </div>
          <div class="form-item">
            <div class="form-attribute">name :</div>
            <div class="form-input">
              <input class="form-input-text" type="text" v-model="loginForm.userName">
            </div>
          </div>
          <div class="form-item">
            <div class="form-attribute">password :</div>
            <div class="form-input">
              <input class="form-input-text" type="text" v-model="loginForm.password">
            </div>
          </div>
          <div class="form-item">
            <div class="form-button-cover">
              <input class="form-button" type="button" value="login" @click="login">
            </div>
          </div>
          <div class="form-close" @click.self="switchDialog">
            +
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { userStore } from '../../stores/userStore'

const emit = defineEmits(['info-update'])

const loginForm = reactive({
  userName: "",
  password: ""
})
let showLogin = ref(false)

const _userStore = userStore();

async function login() {
  if (!loginForm.userName || !loginForm.password) {
    return;
  }
  await _userStore.login(loginForm)

  if (_userStore.state.user.id) {
    emit('info-update')
    loginForm.userName = ''
    loginForm.password = ''
    switchDialog();
  }
}

function switchDialog() {
  showLogin.value = !showLogin.value
}


defineExpose({
  switchDialog
})

</script>
<style lang="scss" scoped>
#login-container {
  z-index: 999 !important;
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: rgba($color: #000000, $alpha: 0.25);
  display: flex;
  align-items: center;
  justify-content: center;

  .login-dialog {
    border-radius: 5%;
    width: 411px;
    height: 311px;
    background-color: #fff;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);

    .form-container {
      // padding-top: 2rem;
      width: 100%;
      height: 100%;
      display: flex;
      position: relative;
      flex-direction: column;
      align-items: center;
      justify-content: center;


      .form-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-items: center;
        width: 100%;
        height: 4rem;

        .form-attribute {
          font-weight: 600;
          padding: 0 10px;
          width: 130px;
          text-align: right
        }

        .form-input {
          opacity: 0.75;
          width: 100%;

          .form-input-text {
            padding: 0 10px;
            width: 75%;
            border: 1px solid var(--base-c-indigo);
            border-radius: 5px;
            line-height: 1rem;
            height: 2rem;
          }
        }

        .form-button-cover {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .form-button {
            width: 100px;
            height: 2rem;
            border-radius: 5px;
            border: 0px;
            background-color: var(--el-color-primary);
            color: var(--base-c-white);
          }
        }

      }

      .form-close {
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 0.75rem;
        font-size: 2.5rem;
        transform: rotate(45deg);
        opacity: 0.75;
      }
    }

  }
}
</style>