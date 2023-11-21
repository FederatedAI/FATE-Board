import store from '@/store/store';
import { createRouter, createWebHashHistory } from 'vue-router';
import routerBeforeEach from './beforeEach';

const routeGet = (name: string) => {
  return routes.find((route: any) => route.name === name)
}

const routes: any[] = [
  {
    name: 'home',
    path: '/',
    redirect: '/running',
    component: () => import('../views/layout/GlobalLayout.vue'),
  },
  {
    name: 'signIn',
    path: '/signIn',
    component: () => import('../views/signIn/SignIn.vue'),
    beforeEnter: async () => {
      store.commit('PUSH_CRUMB', routeGet('running'))
      if (await store.dispatch('signInForMultPage')) {
        store.dispatch('toRecord')
        return false
      }
    }
  },
  {
    name: 'running',
    path: '/running',
    component: () => import('../views/running/Running.vue'),
    pageTag: 'RUNNING',
    beforeEnter: async (to: any) => {
      store.commit('PUSH_CRUMB', to)
      store.commit('POP_TO_ONE')
      await store.dispatch('clearLoaded')
    }
  },
  {
    name: 'history',
    path: '/history',
    component: () => import('../views/history/History.vue'),
    pageTag: 'JOBS',
    beforeEnter: async (to: any) => {
      store.commit('POP_CRUMB')
      store.commit('PUSH_CRUMB', to)
      await store.dispatch('GET_JOB_FIELDS')
      await store.dispatch('clearLoaded')
    }
  },
  {
    name: 'detail',
    path: '/detail/:jobId/:role/:partyId',
    component: () => import('../views/detail/Detail.vue'),
    beforeEnter: async (to: any) => {
      const params = to.params

      store.commit('POP_CRUMB', 'history')
      store.commit('PUSH_CRUMB', {
        name: 'history',
        path: '/history',
      })
      store.commit('PUSH_CRUMB', to)

      await store.dispatch('SET_BASIC', {
        jobId: params.jobId,
        role: params.role,
        partyId: params.partyId
      })
    }
  },
  {
    name: 'dashboard',
    path: '/dashboard/:jobId/:role/:partyId',
    component: () => import('../views/dashboard/Dashboard.vue'),
    beforeEnter: async (to: any) => {
      const params = to.params

      store.commit('POP_CRUMB', 'history')
      store.commit('PUSH_CRUMB', {
        name: 'history',
        path: '/history',
      })
      store.commit('PUSH_CRUMB', to)

      await store.dispatch('SET_BASIC', {
        jobId: params.jobId,
        role: params.role,
        partyId: params.partyId
      })
    }
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../views/404.vue')
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
routerBeforeEach(router)

export default router;
