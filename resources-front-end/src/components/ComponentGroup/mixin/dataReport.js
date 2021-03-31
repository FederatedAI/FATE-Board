
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

function combine(origin, extend) {
  const originKeys = Object.keys(origin)
  for (const key in extend) {
    if (originKeys.indexOf(key) >= 0) {
      Object.assign(origin[key], extend[key])
    } else {
      const hasObj = originKeys.find(item => typeof origin[item] === 'object' && !item.match('csv'))
      if (!hasObj) {
        continue
      }
      for (const val of originKeys) {
        if (!val.match('csv') && typeof origin[val] === 'object') {
          if (combine(origin[val], extend)) {
            break
          }
        }
      }
    }
  }
}

function notNull(res) {
  return res !== '' && res !== null && res !== undefined && !Number.isNaN(res)
}

const dataReport = {
  data() {
    return {
      collecting: false,
      dataCollection: '',
      oldProperty: [],
      needToAsyncProperty: [],
      currentArgs: '',
      currentProperty: '',
      currentComp: '',
      currentCompProp: '',
      originProperty: []
    }
  },
  methods: {
    getNextProperty(propertys, upd = true) {
      let mid = ''
      if (propertys === 'default') return 'default'
      const keys = Object.keys(propertys)
      for (let i = 0, l = keys.length; i < l; i++) {
        const wholeKey = keys[i]
        if (this.originProperty.indexOf(wholeKey) < 0) {
          const hasNextLevel = typeof propertys[wholeKey] === 'object' &&
            Object.keys(propertys[wholeKey]).find((item) => typeof propertys[wholeKey][item] === 'object' && propertys[wholeKey][item] !== null && 'title' in propertys[wholeKey][item])
          if (notNull(propertys[wholeKey].title) && !hasNextLevel) {
            mid = wholeKey
          } else if (hasNextLevel) {
            mid = this.getNextProperty(propertys[keys[i]], false)
          }
          if (!mid) {
            this.originProperty.push(wholeKey)
            continue
          }
          if (upd) {
            this.originProperty.push(mid)
          }
          return mid
        }
      }
      return false
    },
    allSteps(args, comp) {
      this.currentArgs = args
      this.currentProperty = comp || 'group'
      const finalRes = []
      const needRep = args.needExport.join('|')
      let hasForm = this.currentList.find((item) => { return item.type === 'form' })
      const len = this.currentList.length
      for (let i = 0; i < len; i++) {
        const val = this.currentList[i]
        if (val.type === 'form') {
          this.oldProperty.push({ prop: this.refOpera('comp' + i, 'getCurrentProperty'), connectTo: [] })
          const formData = this.refOpera('comp' + i, 'allSteps', args)
          if (formData && Object.keys(formData).length > 0) {
            finalRes.push(formData)
            hasForm = true
          } else {
            hasForm = false
          }
        } else if (['table'].indexOf(val.type) >= 0) {
          const mid = this.refOpera('comp' + i, 'allSteps', args)
          if (mid) {
            if (hasForm) {
              combine(finalRes[finalRes.length - 1], mid)
            } else {
              finalRes.push(mid)
            }
          }
        } else if (['chart', 'async', 'group', 'tabs'].indexOf(val.type) >= 0) {
          const names = this.refOpera('comp' + i, 'getNames')
          const fd = names.find(res => needRep.match(res))
          if (fd) {
            if (hasForm) {
              const mid = this.oldProperty[this.oldProperty.length - 1]
              mid.connectTo.push('comp' + i)
            }
            this.needToAsyncProperty.push({
              data: hasForm ? finalRes[finalRes.length - 1] : 'default',
              comp: 'comp' + i,
              compType: val.type,
              checkName: this.refOpera('comp' + i, 'getNames'),
              position: finalRes.length - 1,
              name: val.name
            })
          }
        }
      }
      if (this.needToAsyncProperty.length > 0) {
        this.collecting = true
        this.$nextTick(() => {
          this.startAsyncRequest(args)
        })
      }
      this.dataCollection = finalRes
      if (!this.collecting) {
        this.$emit('reporter', {
          [this.currentProperty]: this.dataCollection
        }, 'group')
        this.dataCollection = ''
      }
    },

    startAsyncRequest(args = this.currentArgs) {
      const nextComp = this.needToAsyncProperty[0]
      if (nextComp) {
        const nextProperty = this.getNextProperty(nextComp.data)
        if (nextProperty === 'default') {
          if (['chart'].indexOf(nextComp.compType) >= 0 && args.imply.length > 0) {
            this.currentComp = nextComp
            this.currentCompProp = ''
            const checked = this.refOpera(nextComp.comp, 'setImply', args.imply)
            if (!checked) {
              this.refOpera(nextComp.comp, 'allSteps', args)
            }
          } else {
            this.refOpera(nextComp.comp, 'allSteps', args)
          }
          this.needToAsyncProperty.shift()
          this.originProperty = []
        } else if (nextProperty && nextProperty !== 'default') {
          this.currentComp = nextComp
          this.currentCompProp = nextProperty
          if (nextProperty !== this.refOpera(nextComp.comp, 'getCurrentProperty').toString()) {
            this.refOpera(nextComp.comp, 'linkageChange', nextProperty, false, args.imply)
          } else if (['chart'].indexOf(nextComp.compType) >= 0 && args.imply.length > 0) {
            const checked = this.refOpera(nextComp.comp, 'setImply', args.imply)
            if (!checked) {
              this.refOpera(nextComp.comp, 'allSteps', args, nextProperty)
            }
          } else {
            this.refOpera(nextComp.comp, 'allSteps', args, nextProperty)
          }
        } else {
          this.needToAsyncProperty.shift()
          this.originProperty = []
          this.startAsyncRequest()
        }
      } else {
        this.returnToOrigin()
        this.collecting = false
        this.$emit('reporter', {
          [this.currentProperty]: this.dataCollection
        }, 'group')
        this.dataCollection = ''
        this.originProperty = []
      }
    },

    asyncRequestRefreshed() {
      this.refOpera(this.currentComp.comp, 'allSteps', this.currentArgs, this.currentCompProp)
    },

    combineReporter(res, type) {
      const data = this.currentComp.data
      if ((!data || data === 'default') && type === 'chart') {
        for (const key in res) {
          this.dataCollection.push(res[key])
        }
      } else if ((!data || data === 'default') && type === 'group') {
        if (this.dataCollection === '') this.dataCollection = []
        this.dataCollection.push(...res['group'])
      } else if (data && type === 'chart') {
        combine(data, res)
      } else if (data && type === 'group') {
        if (res[this.currentCompProp].length === 1) {
          combine(data, {
            [this.currentCompProp]: res[this.currentCompProp][0]
          })
        } else {
          data.groups = data.groups || []
          data.groups.push(res[this.currentCompProp])
        }
      }
      this.$nextTick(() => {
        this.startAsyncRequest()
      })
    },

    returnToOrigin() {
      for (let i = 0, l = this.oldProperty.length; i < l; i++) {
        const item = this.oldProperty[i]
        for (const val of item.connectTo) {
          this.refOpera(val, 'clearImply')
          this.refOpera(val, 'linkageChange', item.prop)
        }
      }
      this.oldProperty = []
    },

    clearImply() {
      for (let i = 0; i < this.currentList.length; i++) {
        this.refOpera('comp' + i, 'clearImply')
      }
    },

    getNames() {
      const nameList = []
      this.currentList.forEach((item, index) => {
        if (['form', 'table', 'async', 'group', 'chart', 'tabs'].indexOf(item.type) >= 0) {
          const mid = this.refOpera('comp' + index, 'getNames')
          if (Array.isArray(mid) && mid.length > 0) {
            nameList.push(...mid)
          }
        }
      })
      return nameList
    },
    getVariableMap() {
      const res = []
      this.currentList.forEach((item, index) => {
        if (['table', 'group', 'chart', 'async'].indexOf(item.type) >= 0) {
          const mid = this.refOpera('comp' + index, 'getVariableMap')
          if (Array.isArray(mid) && mid.length > 0) {
            res.push(...mid)
          }
        }
      })
      return res.length > 0 ? Array.from(new Set(res)) : res
    },
    hasIv() {
      let res = false
      for (let i = 0, l = this.currentList.length; i < l; i++) {
        const item = this.currentList[i]
        if (['table', 'group'].indexOf(item.type) >= 0) {
          const mid = this.refOpera('comp' + i, 'hasIv')
          if (mid) {
            res = mid
            break
          }
        }
      }
      return res
    },
    handleFilterLogic(filters) {
      let res = false
      for (let i = 0, l = this.currentList.length; i < l; i++) {
        const item = this.currentList[i]
        if (['table', 'group'].indexOf(item.type) >= 0) {
          const mid = this.refOpera('comp' + i, 'handleFilterLogic', filters)
          if (mid) {
            res = mid
            break
          }
        }
      }
      return res
    }
  }
}

export default dataReport
