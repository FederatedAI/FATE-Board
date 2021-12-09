<template>
  <div class="app-container login-container flex flex-col flex-center">
    <span class="title">Welcome to FATEBoard</span>
    <!-- 当前登录提示内容 -->
    <hint
      :type="hintType"
      :text="hintMsg"
      :class="{
        ['hint_'+hintType]: !!hintMsg
      }"
      class="hint"
    >
      <i slot="prefix" :class="'el-icon-' + hintType" />
    </hint>
    <!-- username -->
    <el-form size="mini">
      <el-form-item>
        <el-input
          v-model="username"
          :class="{
            ['input_'+hintType]: usernameHint
          }"
          size="mini"
          placeholder="Username/Email/Phone"
          class="input"
          @select="handleSelector"
          @input="errorHintHide"
        >
          <!-- <template slot-scope="{ item }">
            <div class="auto-container">
              <div class="auto-info">
                <div class="name">{{ item.username }}</div>
                <span class="addr">{{ item.passwordSec }}</span>
              </div>
              <span v-if="item.default" class="hint-def">(Default)</span>
            </div>
          </template> -->
        </el-input>
      </el-form-item>
      <el-form-item>
        <!-- password -->
        <el-input
          v-model="password"
          :type="inputType"
          :class="{
            ['input_'+hintType]: passwordHint
          }"
          placeholder="password"
          size="mini"
          class="input"
          @input="errorHintHide"
        >
          <img
            slot="suffix"
            :src="inputType==='text' ? eyeOnSee : eyeUnSee"
            class="eye_hint"
            @click="exchangeType"
          >
        </el-input>
      </el-form-item>
      <!-- 缓存当前账号 -->
      <!-- <el-form-item>
        <el-checkbox v-model="willCache" class="checked">remember me</el-checkbox>
      </el-form-item> -->
      <!-- login -->
      <el-form-item class="form-item-center">
        <el-button :type="btnType" :disabled="btnDisable" size="mini" class="btn" @click="signIn">Sign in</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import Hint from './hint'
import { mapActions } from 'vuex'
function checkedLoginState(that) {
  const user = localStorage.getItem('CurrentUser') // 用户信息
  if (user) {
    if (!that.$store.user.state.username) {
      that.$store.dispatch('setInfo', user)
    }
    that.$router.push({
      name: 'RUNNING'
    })
  }
}

export default {
  name: 'Login',

  components: {
    Hint
  },
  props: {},

  data() {
    return {
      // 当前有待提示的错误信息
      hintType: 'error',
      hintMsg: '',

      username: '',
      selectable: null,
      usernameHint: false,

      password: '',
      inputType: 'password',
      passwordHint: false,

      willCache: true,

      btnType: 'primary',
      btnDisable: false,
      checkedLogin: checkedLoginState.bind(null, this),

      eyeOnSee: require('../../icons/svg/eyes.svg'),
      eyeUnSee: require('../../icons/svg/eyes_unsee.svg')
    }
  },

  beforeMount() {
    window.addEventListener('storage', this.checkedLogin)
    this.$store.dispatch('removeInfo')
  },
  beforeDestroy() {
    window.removeEventListener('storage', this.checkedLogin)
  },

  methods: {
    ...mapActions({
      login: 'Login'
    }),
    queryValue(qs, cb) {
      const filterList = this.getAccount()
      cb(filterList.filter(val => (qs ? val.username.match(qs) : true)))
    },

    handleSelector(item) {
      this.username = item.username
      this.password = item.password
    },

    getAccount() {
      if (!this.selectable) {
        let mid = JSON.parse(localStorage.getItem('AccountCache'))
        if (!mid) {
          this.setAccount('admin', 'admin', true)
          mid = JSON.parse(localStorage.getItem('AccountCache'))
        }
        this.selectable = mid
      }
      return this.selectable
    },

    setAccount(username, password, def) {
      const cacheData = {
        username: username || this.username,
        password: password || this.password,
        passwordSec: new Array(
          password ? password.length : this.password.length
        )
          .fill('*')
          .join(''),
        default: def
      }
      if (!this.selectable) this.selectable = []
      const index = this.selectable.findIndex(val => {
        return val.username === cacheData.username
      })
      if (index < 0) {
        this.selectable.push(cacheData)
      } else {
        this.selectable[index] = cacheData
      }
      localStorage.setItem('AccountCache', JSON.stringify(this.selectable))
    },

    signIn() {
      if (!this.username) {
        this.errorHint('username should not be empty')
        this.usernameHint = true
        return false
      }
      if (!this.password) {
        this.errorHint('password should not be empty')
        this.passwordHint = true
        return false
      }
      const afterRequest = bool => {
        if (bool) {
          if (this.willCache) {
            // this.setAccount()
          }
          this.$router.push({
            name: 'RUNNING'
          })
        } else {
          this.errorHint('Incorrect username or password')
          this.usernameHint = true
          this.passwordHint = true
        }
      }
      // 请求返回后台信息
      this.login({
        username: this.username,
        password: this.password
      })
        .then(val => {
          afterRequest(true)
        })
        .catch(() => {
          afterRequest(false)
        })
    },

    errorHint(msg, type) {
      this.hintType = type || 'warning'
      this.hintMsg = msg
    },

    errorHintHide() {
      this.hintMsg = ''
      this.usernameHint = false
      this.passwordHint = false
    },

    exchangeType() {
      if (this.inputType === 'text') {
        this.inputType = 'password'
      } else {
        this.inputType = 'text'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.login-container {
	height: 100%;
	margin-top: 24px;
	.title {
		background: linear-gradient(159deg, #5e7feb 0%, #0ec7a5 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-size: 50px;
		margin-top: 10%;
	}
	.hint {
		min-height: 20px;
		margin-top: 30px;
		i {
			height: 100%;
			margin-right: 12px;
		}
	}
	.hint_error {
		i {
			color: #ff4f38 !important;
		}
	}
	.hint_warning {
		i {
			color: #ff4f38 !important;
		}
	}
	.input {
		width: 30%;
		min-width: 300px;
	}
	.input_error {
		input {
			border-color: #ffd1cb !important;
		}
	}
	.input_warning {
		input {
			border-color: #ffd1cb !important;
		}
	}
	.eye_hint {
		width: 20px;
		height: 100%;
	}
}
.auto-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	.auto-info {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		align-items: flex-start;
	}
	.hint-def {
		color: #bbb;
	}
}
.form-item-center {
  display: flex;
  justify-content: center;
}
</style>
