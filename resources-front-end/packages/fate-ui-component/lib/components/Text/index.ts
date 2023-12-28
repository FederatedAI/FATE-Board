import FColumn from './Column.vue'
import FContext from './Context.vue'
import FImply from './Implying.vue'
import FOverflow from './Overflow.vue'
import FRow from './Row.vue'
import './Text.scss'

const TextInstall = (app: any) => {
  app.component('FOverflow', FOverflow)
  app.component('FRow', FRow)
  app.component('FColumn', FColumn)
  app.component('FContext', FContext)
  app.component('FImply', FImply)
}

export default TextInstall