import './VirtualScroll.scss'
import FVirtualScroll from './VirtualScroll.vue'

const VirtualScrollInstall = (app: any) => {
  app.component('FVirtualScroll', FVirtualScroll)
}

export default VirtualScrollInstall