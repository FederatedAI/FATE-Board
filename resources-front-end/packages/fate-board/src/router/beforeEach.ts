import store from '@/store/store';

export default function routerBeforeEach(router: any) {
  router.beforeEach((to: any, from: any, next: any) => {
    if (!to.name.match(/signin/i)) {
      store.dispatch('setRouteRecord', to)
    }
    if (!(store.state as any).auth.username && !to.name.match(/signin/i)) {
      next({ path: '/signIn' });
    } else {
      next();
    }
  });
}
