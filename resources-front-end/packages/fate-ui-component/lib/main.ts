import BreadCrumbInstall from '@/components/BreadCrumb'
import ColorGradientInstall from '@/components/ColorGradient'
import InputInstall from '@/components/Input'
import SelectionInstall from '@/components/Selection'
import TableInstall from '@/components/Table'
import TabsInstall from '@/components/Tabs'
import TextInstall from '@/components/Text'
import VirtualScrollInstall from '@/components/VirtualScroll'
import './adapter'
import { default as FBreadCrumb } from './components/BreadCrumb/BreadCrumb.vue'
import { default as FColorGradient } from './components/ColorGradient/ColorGradient.vue'
import { default as FInput } from './components/Input/Input.vue'
import { default as FSelection } from './components/Selection/Selection.vue'
import { default as FSelectionChart } from './components/Selection/SelectionChart.vue'
import { default as FTable } from './components/Table/Table.vue'
import { default as FTabs } from './components/Tabs/Tabs.vue'
import { default as FTabsBySelection } from './components/Tabs/TabsBySelection.vue'
import { default as FColumn } from './components/Text/Column.vue'
import { default as FText } from './components/Text/Context.vue'
import { default as FImply } from './components/Text/Implying.vue'
import { default as FOverflow } from './components/Text/Overflow.vue'
import { default as FRow } from './components/Text/Row.vue'
import { default as FVurticalScroll } from './components/VirtualScroll/VirtualScroll.vue'

const install = (app: any) => {
  TextInstall(app)
  SelectionInstall(app)
  TableInstall(app)
  TabsInstall(app)
  BreadCrumbInstall(app)
  VirtualScrollInstall(app)
  ColorGradientInstall(app)
  InputInstall(app)
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
  FImply,
  FColorGradient,
  FSelectionChart,
  FInput,
  FTabsBySelection,
  install,
  version
}

