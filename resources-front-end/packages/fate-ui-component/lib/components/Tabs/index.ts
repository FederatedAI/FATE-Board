import FTabs from './Tabs.vue'
import FTabsBySelection from './TabsBySelection.vue'

const TabsInstall = (app: any) => {
  app.component('FTabs', FTabs)
  app.component('FTabsBySelection', FTabsBySelection)
}

export default TabsInstall