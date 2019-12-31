/**
 * layer for canvas stuff , canvas exaihibition was combine lots of layer。
 * Each layer can be a component.
 * Layer lifecycle like above:
 *    1. init: (native)
 *         description：initing options
 *    2. afterInit: (hook)
 *         param：{options}
 *         description：operations after init.
 *    3. beforeDrawing: (hook)
 *         param：{options}
 *         description：options will be copy from origin data
 *    4. drawing：(native)
 *         param: {options}
 *         description: drawing path
 *    5. afterDrawing: (hook)
 *         param: {options}
 *         description: after drawing we can do
 */
import { optionInit } from './options'
import { lifecycleInit } from './lifecycle'
import { drawingInit } from './drawing'
import { animationInit } from './animation'
import { eventsInit } from './events'

export default function Layer(options) {
  this._startLifecycle()
  this._initOptions(options)
  this._initEvents(options)
  this._initDrawing(this.path)
  this._initAnimation(options)
}

lifecycleInit(Layer)
optionInit(Layer)
drawingInit(Layer)
eventsInit(Layer)
animationInit(Layer)
