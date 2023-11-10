import './VirtualScroll.scss'
import FVirtualScroll from './VirtualScroll.vue'

const VirtualScrollInstall = (app: any) => {
  app.component('FVurticalScroll', FVirtualScroll)
}

export default VirtualScrollInstall