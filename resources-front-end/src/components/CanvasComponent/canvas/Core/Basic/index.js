import status from './status'
import draw from './draw'
import events from './events'
import translate from './translate'
import { exportTool } from './utils'

export default function Layer(obj) {
  const lay = this
  lay._InitStatus(obj)
  lay._InitEvents(obj)
}

status(Layer)
translate(Layer)
draw(Layer)
events(Layer)
exportTool(Layer)
