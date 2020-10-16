
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

import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
 **/
export const constantRouterMap = [
  {
    path: '/',
    component: Layout,
    redirect: '/running',
    name: 'Dashboard',
    hidden: true,
    children: [
      {
        path: '/running',
        name: 'RUNNINNG',
        component: () => import('@/views/job-running')
      },
      {
        path: '/dashboard',
        component: () => import('@/views/job-dashboard/index')
      },
      // {
      //   path: '/refresh',
      //   component: () => import('@/views/Refresh')
      // },
      // {
      //   path: '/data-center',
      //   name: 'DATA CENTER',
      //   component: () => import('@/views/data-center')
      // },
      // {
      //   path: '/experiment',
      //   name: 'EXPERIMENT',
      //   component: () => import('@/views/experiment')
      // },
      {
        path: '/history',
        name: 'HISTORY',
        component: () => import('@/views/job-history')
      },
      // {
      //   path: '/createExperiment',
      //   name: 'CreateExperiment',
      //   component: () => import('@/views/create-experiment')
      // },
      // {
      //   path: '/editExperiment',
      //   name: 'editExperiment',
      //   component: () => import('@/views/create-experiment')
      // },
      // {
      //   path: '/jobSetting',
      //   name: 'JobSetting',
      //   component: () => import('@/views/job-history-setting')
      // },
      {
        path: '/details',
        name: 'JobDetails',
        component: () => import('@/views/job-details')
      }
      // {
      //   path: '/oldDashboard',
      //   name: 'Dashboard',
      //   component: () => import('@/views/old-job-dashboard')
      // }
    ]
  },
  // { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },
  { path: '*', redirect: '/404', hidden: true }
]

const router = new Router({
  // mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
router.beforeEach((to, from, next) => {
  if (to.path === '/history') {
    if (from.query.page || from.params.page) {
      to.params.page = from.query.page
      to.params.search_job_id = from.query.search_job_id
      to.params.search_party_id = from.query.search_party_id
      to.params.search_role = from.query.search_role
      to.params.search_status = from.query.search_status
    }
    // console.log(to, from)
    next()
  } else {
    next()
  }
})
export default router
