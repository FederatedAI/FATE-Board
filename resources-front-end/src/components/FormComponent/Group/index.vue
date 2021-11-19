<script>
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import basicOperation from '@/mixin/BasicOperation'
import Comp from './components'
export default {
  name: 'Cformgroup',
  components: {
    ccheckbox: () => import('../Checkbox'),
    cradio: () => import('../Radio'),
    ceditor: () => import('../Editor'),
    cinput: () => import('../Input'),
    cselect: () => import('../Select'),
    cstep: () => import('../Step'),
    ctext: () => import('../Text'),
    cselection: () => import('../Selection'),
    ctitle: () => import('../Text/Title'),
    csearch: () => import('../Searching'),
    cbutton: () => import('../Button'),
    clegend: () => import('../Legend'),
    crefresh: () => import('../Refresh'),
    crange: () => import('../Slider'),
    ctransform: () => import('../TransForm'),
    ctabs: () => import('../Tabs'),
    ctreeSelect: () => import('../TreeSelect'),
    ctableFilter: () => import('../TableSelection'),
    cheaderPagination: () => import('../HeaderPagination'),
    clabelTab: () => import('../labelTab'),
    cslider: () => import('../Slider'),
    ctslider: () => import('../tableSlider')
  },
  mixins: [basicOperation],
  props: {
    form: {
      type: Array,
      default: () => []
    },

    default: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },

    className: {
      type: String,
      default: ''
    },
    confirmBtn: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String | Boolean,
      default: false
    },
    resetBtn: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String | Boolean,
      default: false
    },
    inrow: {
      type: Boolean | String,
      default: false
    },
    rowDir: {
      type: String,
      default: 'mid'
    },
    unique: {
      type: String,
      default: 'formGroup'
    }
  },
  data() {
    return {
      filtersType: ['filterSelect', 'step', 'checkbox', 'radio'],
      filterProperty: {},
      formType: ['input', 'select'],
      formParam: {},
      needConnect: ['text', 'title', 'headerPagination', 'tslider'],

      canSend: false,
      finalList: []
    }
  },
  watch: {
    filterProperty: {
      handler() {
        if (!this.canSend) {
          if (!this.default) {
            this.canSend = true
          } else {
            let canSend = true
            for (let i = 0; i < this.finalList.length; i++) {
              const val = this.finalList[i]
              if (
                this.typeChecking(val.type) &&
								!this.filterProperty[val.name || 'comp' + i]
              ) {
                canSend = false
                break
              }
            }
            this.canSend = canSend
          }
        }
        if (this.canSend) {
          this.change()
        }
      },
      deep: true
    },
    formParam: {
      handler() {
        if (!this.confirmBtn) {
          this.confirm()
        }
      },
      deep: true
    },
    disabled() {
      if (this.disabled) {
        this.disable()
      } else {
        this.able()
      }
    }
  },
  mounted() {
    if (this.disabled) {
      this.disable()
    }
  },
  methods: {
    linkageOutside(val) {
      for (let i = 0; i < this.finalList.length; i++) {
        const item = this.finalList[i]
        if (this.needConnect.indexOf(this.finalList[i].type) >= 0) {
          this.refOpera(item.name || 'comp' + i, 'linkageOutside', val)
        }
      }
    },

    resize() {
      for (let i = 0; i < this.finalList.length; i++) {
        this.refOpera('comp' + i, 'resize')
      }
    },

    allSteps(args) {
      const res = {}
      this.finalList.forEach((item, index) => {
        if (this.typeChecking(item.type)) {
          Object.assign(res, this.refOpera(item.name || 'comp' + index, 'allSteps', args))
        }
      })
      return res
    },

    getNames() {
      const res = []
      this.finalList.forEach((item, index) => {
        const mid = this.typeChecking(item.type) ? this.refOpera('comp' + index, 'getNames') : false
        if (mid) {
          res.push(...mid)
        }
      })
      return res
    },

    searching(res) {
      this.$emit('search', res)
    },

    getParam() {
      return this.formParam
    },

    setDefault(setting) {
      const config = setting && setting[this.unique]
      if (this.default) {
        if (!(Object.keys(this.$refs).length >= this.finalList.length)) {
          return false
        }
        for (let i = 0; i < this.finalList.length; i++) {
          const val = this.finalList[i]
          if (val.type.toString().match('-')) {
            if (!this.refOpera(val.name || 'comp' + i, 'setDefault', config)) {
              return false
            }
          }
        }
      }
      return true
    },

    getSelected() {
      let result = {}
      for (let i = 0; i < this.finalList.length; i++) {
        const val = this.finalList[i]
        if (val.type.toString().match('-')) {
          result = Object.assign(result, this.refOpera(val.name || 'comp' + i, 'getSelected'))
        }
      }
      return {
        [this.unique]: result
      }
    },

    disable() {
      for (let i = 0; i < this.finalList.length; i++) {
        const val = this.finalList[i]
        this.refOpera(val.name || 'comp' + i, 'disable')
      }
    },

    able() {
      for (let i = 0; i < this.finalList.length; i++) {
        const val = this.finalList[i]
        this.refOpera(val.name || 'comp' + i, 'able')
      }
    },

    change() {
      this.$emit('change', this.getCurrentProperty())
    },

    getCurrentProperty() {
      const getProperty = obj => {
        const res = []
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            res.push(...obj[key])
          } else {
            res.push(obj[key])
          }
        }
        return res
      }
      return getProperty(this.filterProperty)
    },

    confirm() {
      this.$emit('form', this.formParam)
    },

    refreshing() {
      this.$emit('refresh')
    },

    range(param) {
      this.$emit('range', param)
    },

    selected(param) {
      this.$emit('selected', param)
    },

    headerChange(page) {
      this.$emit('headerPage', page)
    },

    filterTable(param) {
      this.$emit('filterTable', param)
    },

    reset() {
      for (let i = 0; i < this.finalList.length; i++) {
        const val = this.finalList[i]
        this.refOpera(val.name || 'comp' + i, 'reset')
      }
    },

    compChange(name, type) {
      return res => {
        if (this.typeChecking(type)) {
          this.$set(this.filterProperty, name, res)
        } else {
          this.$set(this.formParam, name, res)
        }
      }
    },

    connectTo(list, connect, operation, param) {
      const li = this.toArr(connect)
      for (const val of li) {
        let name = ''
        if (typeof val === 'number') {
          const item = list[val]
          name = item.name || 'comp' + val
        } else {
          name = val
        }
        this.refOpera(name, 'by' + operation, param)
      }
    },

    compEvents(list, name, type, ons, connect) {
      const res = {}
      if (this.typeChecking(type) || type === 'group') {
        res.change = res => {
          this.compChange(name, type)(res)
          this.connectTo(
            list,
            connect,
            'Change',
            this.typeChecking(type)
              ? this.filterProperty[name]
              : this.formParam[name]
          )
        }
      }
      if (!this.typeChecking(type) || type === 'group') {
        res.form = data => {
          this.$set(this.formParam, name, data)
          this.connectTo(list, connect, 'Form', this.formParam[name])
        }
      }

      if (type === 'refresh' || type === 'f-tabs' || type === 'tabs') {
        res.refresh = () => {
          this.refreshing()
        }
      }
      if (type.toLowerCase().match(/(range|tslider)/)) {
        res.range = param => {
          this.range(param)
        }
      }
      if (type.toLowerCase().match('headerpagination')) {
        res.headerChange = param => {
          this.headerChange(param)
        }
      }
      if (type.toLowerCase().match('tablefilter')) {
        res.filterTable = param => {
          this.filterTable(param)
        }
      }
      res.search = res => {
        this.searching(res)
      }
      return Object.assign({}, ons, res)
    },

    typeChecking(type) {
      const stats = type.split('-')
      if (stats.length > 1 && stats[0].match(/^f|filter/)) {
        return true
      } else {
        return false
      }
    },

    createComp(h, list, val, pos) {
      const name = val.name || 'comp' + pos
      const variable = {
        props: Object.assign({}, val.props),
        // attrs: Object.assign({}, val.props),
        ref: name,
        class: 'form__each',
        on: this.compEvents(list, name, val.type, val.on, val.connect)
      }
      const child = h(this.impling(val.type), variable)
      return child
    },

    rowComps(h, list, startPos = 0, endPos) {
      const res = []
      const end = endPos || list.length
      for (let i = startPos; i < end; i++) {
        const val = list[i]
        res.push(this.createComp(h, list, val, i))
      }
      return h('div', {
        'class': this.rowDir === 'mid' ? 'group__inrow-container' : 'group__inrow-right'
      }, res)
    },

    needTobInrow(list) {
      let hasSearch = false
      for (const val of list) {
        if (val.type.toLowerCase().match(/(search|tablefilter)/)) {
          hasSearch = true
          break
        }
      }
      return hasSearch
    },

    checkOnlySearching(compList) {
      if (compList.length === 1 && compList[0] && compList[0].type.toLowerCase().match('search')) {
        return true
      }
      return false
    },

    comps(h, list) {
      const res = []
      const needTobInrow = this.needTobInrow(list)
      for (let i = 0; i < list.length; i++) {
        const val = list[i]
        if (i === list.length - 2 && needTobInrow) {
          res.push(this.rowComps(h, list, i))
          break
        }
        res.push(this.createComp(h, list, val, i))
      }
      return res
    },

    impling(type) {
      const stats = type.split('-')
      if (stats.length > 1) {
        if (stats[1].match('select')) {
          return 'cselection'
        } else {
          return Comp.exchangeTo(stats[1])
        }
      } else {
        return Comp.exchangeTo(type)
      }
    },

    addConfirmBtn() {
      return {
        type: 'button',
        props: {
          label: 'confirm'
        },
        on: {
          clickBtn: () => {
            this.confirm()
          }
        }
      }
    },

    addResetBtn() {
      return {
        type: 'button',
        props: {
          label: 'reset'
        },
        on: {
          clickBtn: () => {
            this.reset()
          }
        }
      }
    },

    positionCheck(list) {
      const rlist = list.sort((a, b) => {
        if (a.type.toLowerCase().match('search')) {
          return 1
        } else if (b.type.toLowerCase().match('search')) {
          return -1
        } else {
          return 0
        }
      })
      return rlist
    },

    setFinalList(list) {
      this.finalList = list
    },

    group(h) {
      const compList = this.positionCheck([...this.form])
      if (this.confirmBtn) {
        compList.push(this.addConfirmBtn())
      }
      if (this.resetBtn) {
        compList.push(this.addResetBtn())
      }
      this.setFinalList(compList)
      return h(
        'section',
        {
          class: 'group__container ' + (this.inrow ? this.inrow === 'left' ? 'group__inrow-container-left' : 'group__inrow-container' : '') + this.className + (this.checkOnlySearching(compList) ? 'group__inrow-right' : '')
        },
        this.comps(h, compList)
      )
    }
  },
  render(h) {
    return this.group(h)
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.group__container {
	@include flex(column, flex-start, flex-start);
}
.group__inrow-container {
	width: 100%;
	@include flex(row, space-between, center);
	.form__each {
		margin-right: 12px;
		&:last-child {
			margin-right: 0px;
		}
	}
}
.group__inrow-container-left {
	width: 100%;
	@include flex(row, flex-start, center);
	.form__each {
		margin-right: 12px;
		&:last-child {
			margin-right: 0px;
		}
	}
  .filter__container {
    width: auto;
  }
}
.group__inrow-right {
	@include flex(row, flex-end, center);
  .filter__container {
    width: auto;
  }
}
</style>
