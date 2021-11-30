
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

import axios from 'axios'
// import store from '@/store'
import { Message } from 'element-ui'
// import store from '@/store'
// import { getToken } from '@/utils/auth'
import { saveAs } from 'file-saver'
import router from '../router'
import { removeLocal } from './localStorage'
import store from '../store'

// axios.defaults.headers.common['Authorization'] = getToken()
// create an axios instance
// console.log(window.location.origin)
const service = axios.create({
  baseURL: process.env.BASE_API || window.location.origin,
  withCredentials: process.env.CORS,
  timeout: 20000 // request timeout
})
// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    // if (store.getters.token) {
    //   config.headers['Authorization'] = getToken()
    // }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
   */
  response => {
    const data = response.data
    const header = response.headers
    const codeCheck = function(res) {
      if (res.code === 0) {
        // debugger
        return new Promise(resolve => {
          // if (store.getters.isOpenReqSimulate) {
          //   setTimeout(function() {
          //     resolve(res)
          //     // console.log('util.request: response:', res)
          //   }, 1000)
          // } else {
          resolve(res)
          // console.log('util.request: response:', res)
          // }
        })
      } else if (res.code === 100) {
        Message({
          message: res.message || res.msg || res.retmsg || (res.data && res.data.retmsg),
          type: 'warning',
          duration: 3 * 1000
        })
        // return new Promise(resolve => {
        //   // if (store.getters.isOpenReqSimulate) {
        //   //   setTimeout(function() {
        //   //     resolve(res)
        //   //     // console.log('util.request: response:', res)
        //   //   }, 1000)
        //   // } else {
        //   resolve(res)
        //   // console.log('util.request: response:', res)
        //   // }
        // })
        return Promise.reject('warning')
      } else if (res.code === 10015) {
        // 表示当前的内容为没有登录，所以直接跳转到登录界面。
        // debugger
        removeLocal('CurrentUser')
        store.dispatch('removeInfo')
        router.push({
          name: 'login'
        })
        return Promise.reject('error')
      } else {
        Message({
          message: res.message || res.msg || res.retmsg,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject('error')
      }
    }
    // 如果数据是blob则转换完成之后进行下一步骤。
    if (header['content-disposition'] || data.toString().match(/blob/i)) {
      const filename = header['content-disposition'] ? header['content-disposition'].split('=')[1] : ''

      const reader = new FileReader()
      reader.addEventListener('loadend', function() {
        const result = JSON.parse(reader.result)
        if (result.code !== undefined) {
          return codeCheck(result)
        } else {
          saveBlob(data, filename)
        }
      })
      reader.readAsText(data)
    } else {
      return codeCheck(data)
    }
  },
  error => {
    console.log('err:', error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

function saveBlob(blob, name) {
  saveAs(blob, name)
}

export default service
