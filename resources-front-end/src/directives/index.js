import drag from './drag/index'
import scale from './scale/index'

const install = function(Vue) {
  Vue.directive('drag', drag)
  Vue.directive('scale', scale)
  // Vue.use(install)
}

export default install
