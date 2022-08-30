
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

import { login, logout, getInfo } from '@/api/login'
// import { getToken } from '@/utils/auth'
import { getLocal, setLocal, removeLocal } from '../../utils/localStorage'
// import HmacSha1 from 'hmac_sha1'
import { security } from '../../api/login'
import rsa from '../../utils/encrypt'

// function nonceCreate(length) {
//   if (length > 0) {
//     var data = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
//     var nums = ''
//     for (var i = 0; i < length; i++) {
//       var r = parseInt(Math.random() * 61)
//       nums += data[r]
//     }
//     return nums
//   } else {
//     return false
//   }
// }

// function saltPassword(password) {
//   const nonce = nonceCreate(12)
//   const timestamp = new Date().getTime()

//   const hmacSha1 = new HmacSha1()
//   return {
//     nonce,
//     timestamp,
//     password: hmacSha1.digest(password, nonce + timestamp)
//   }
// }

const user = {
  state: {
    token: '',
    name: '',
    username: getLocal('CurrentUser') || '',
    avatar: '',
    roles: ''
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    }
  },

  actions: {
    async Login({ commit }, userInfo) {
      // return new Promise((resolve, reject) => {
      const username = userInfo.username.trim()
      const securityInfo = await security()
      let securityData = ''
      if (securityInfo && securityInfo.data) securityData = securityInfo.data
      const password = rsa(securityData, userInfo.password)
      const response = await login(username, password)
      const data = response.data
      if (!data) throw new Error('Account is not matched')
      const token = !data ? username : (data.tokenHead || username) + (data.token || '')
      // setToken(token, new Date(new Date().getTime() + 30 * 60 * 1000))
      commit('SET_TOKEN', token)
      commit('SET_USERNAME', username)
      setLocal('CurrentUser', username)
      return true
    },

    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const data = response.data
          if (data.roles && data.roles.length > 0) {
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(res => {
          commit('SET_TOKEN', '')
          removeLocal('CurrentUser')
          commit('SET_ROLES', [])
          commit('SET_USERNAME', '')
          // removeToken()
          resolve()
        }).catch(() => {
          commit('SET_TOKEN', '')
          removeLocal('CurrentUser')
          commit('SET_ROLES', [])
          commit('SET_USERNAME', '')
          // removeToken()
          resolve()
          // reject(error)
        })
      })
    },

    setInfo({ commit }, username) {
      // 临时用于信息设置
      commit('SET_USERNAME', username)
      commit('SET_TOKEN', username)
    },

    removeInfo({ commit }) {
      // 删除当前的存储的信息
      commit('SET_USERNAME', '')
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
    }
  }
}

export default user
