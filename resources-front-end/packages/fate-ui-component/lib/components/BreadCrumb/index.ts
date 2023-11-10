import './BreadCrumb.scss'
import FBreadCrumb from './BreadCrumb.vue'

const BreadCrumbInstall = (app: any) => {
  app.component('FBreadCrumb', FBreadCrumb)
}

export default BreadCrumbInstall