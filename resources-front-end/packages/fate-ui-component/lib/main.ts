import BreadCrumbInstall from '@/components/BreadCrumb'
import VirtualScroll from '@/components/Scroll'
import SelectionInstall from '@/components/Selection'
import TableInstall from '@/components/Table'
import TabsInstall from '@/components/Tabs'
import TextInstall from '@/components/Text'
import './adapter'
import { default as FBreadCrumb } from './components/BreadCrumb/BreadCrumb.vue'
import { default as FVurticalScroll } from './components/Scroll/VirtualScroll.vue'
import { default as FSelection } from './components/Selection/Selection.vue'
import { default as FTable } from './components/Table/Table.vue'
import { default as FTabs } from './components/Tabs/Tabs.vue'
import { default as FColumn } from './components/Text/Column.vue'
import { default as FText } from './components/Text/Context.vue'
import { default as FOverflow } from './components/Text/Overflow.vue'
import { default as FRow } from './components/Text/Row.vue'

const install = (app: any) => {
  TextInstall(app)
  SelectionInstall(app)
  TableInstall(app)
  TabsInstall(app)
  BreadCrumbInstall(app)
  VirtualScroll(app)
}
const version = '1.0.0'

export * from './UIParse'
export * from './utils'
export {
  FBreadCrumb,
  FSelection,
  FTable,
  FTabs,
  FColumn,
  FText,
  FOverflow,
  FRow,
  FVurticalScroll,
  install,
  version
}

