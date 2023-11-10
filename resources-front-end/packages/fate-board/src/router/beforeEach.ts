import store from '@/store/store';

let First_Router: any
let Has_Push = false
export default function routerBeforeEach(router: any) {
  router.beforeEach((to: any, from: any, next: any) => {
    if (!First_Router) First_Router = to

    if (!(store.state as any).auth.username && !to.name.match(/signin/i)) {
      next({ path: '/signIn' });
    } else if (to.path.match('signIn')) {
      if (!store.state.auth.username) {
        next()
      } else {
        next({ path: '/running'})
      }
    } else if (First_Router && !Has_Push) {
      if (!First_Router.name.match(/signIn/)) {
        const toNext = First_Router
        Has_Push = true
        next(toNext)
      } else {
        next()
      }
    } else {
      if (to === First_Router) {
        First_Router = undefined
      }
      next();
    }
  });
}

export function redirect (FirstRouter?: any) {
  if (FirstRouter) {
    First_Router = FirstRouter
  }
  Has_Push = false
}
