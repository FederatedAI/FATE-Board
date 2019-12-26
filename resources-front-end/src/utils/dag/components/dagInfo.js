class Dag {
  constructor(data) {
    this._init(data)
  }

  _init(data) {
    this._level = []
    this._root = []
    this._componentsParse(data)
  }

  // init node info and relationship
  _componentsParse(data) {
    // initing node info
    const _this = this
    const _initNodeInfo = function(data) {
      const list = data.component_list
      const hasNew = []
      for (let i = 0; i < list.length; i++) {
        const val = list[i]
        hasNew.push({ name: val.component_name, node: new DagNode(val) })
      }
      return hasNew
    }
    // check dependencies
    const _initDependencies = function(data, hasNew) {
      const dep = data.dependencies
      for (const key in dep) {
        for (const val of hasNew) {
          if (val.name === key) {
            val.node.setDependency(dep[key], hasNew)
            break
          }
        }
      }
    }
    // get root node for whole dag pic
    const _getRoot = function(instances) {
      let rootAlter = []
      for (const val1 of instances) {
        rootAlter.push(val1.name) // all root-node alternative instance
      }
      for (const val2 of instances) {
        const c = val2.node.hasChild()
        if (c.length > 0) {
          for (const s of c) {
            rootAlter = rootAlter.join(',')
            rootAlter = rootAlter.replace(new RegExp(s.name + ',?'), '')
            rootAlter = rootAlter.split(',')
          }
        }
      }
      for (let i = 0; i < rootAlter.length; i++) {
        if (!rootAlter[i]) {
          rootAlter.splice(i, 1)
          i--
        }
      }
      rootAlter = rootAlter.join()
      for (const val3 of instances) {
        if (rootAlter.indexOf(val3.name) >= 0) {
          _this._root.push(val3.node)
        }
      }
    }
    // get the level info and check level of node
    const _countingLevel = function() {
      for (const val of _this._root) {
        val._initLevel(1)
      }
    }
    // get level counting info for all
    const _levelInfo = function(node, level) {
      if (!level) level = []
      if (!(node instanceof Array)) node = [node]
      for (const key of node) {
        if (!level[key.level - 1]) level[key.level - 1] = []
        let add = true
        for (const v of level[key.level - 1]) {
          if (v.name === key.name) {
            add = false
            break
          }
        }
        if (add) level[key.level - 1].push(key)
        const list = key.hasChild()
        level = _levelInfo(list, level)
      }
      return level
    }
    const hasNew = _initNodeInfo(data)
    _initDependencies(data, hasNew)
    _getRoot(hasNew)
    _countingLevel()
    this._level = _levelInfo(this._root, this._level)
  }

  // get position for each node
  calculatePosition(canvas, dagW, dagH, betLM, betInn, betModel, toTop) {
    let actualWidth = 0
    let actualHeight = toTop
    const deviation = betModel + dagW
    const size = { width: canvas.width, height: canvas.height }
    const middleX = size.width / 2
    for (const val of this._level) {
      const startX = middleX - ((val.length - 1) / 2 * deviation)
      if ((val.length - 1) * deviation + dagW > actualWidth) {
        actualWidth = (val.length - 1) * deviation + dagW
      }
      for (let i = 0; i < val.length; i++) {
        val[i].setPosition(startX + i * deviation, actualHeight + dagH / 2)
        actualHeight += (dagH + betInn)
      }
      actualHeight += (betLM + betInn)
    }
    actualHeight -= toTop
    return { width: actualWidth, height: actualHeight }
  }

  getRoot() {
    return this._root
  }

  getLevel() {
    return this._level
  }

  levelWidth(index, mw) {
    const row = this._level[index]
    const width = row[row.length - 1].getPosition().x - row[0].getPosition().x + mw + 4
    return { width, sx: row[0].getPosition().x - mw / 2, es: row[row.length - 1].getPosition().x + mw / 2 }
  }

  levelHeight(index, mh) {
    const col = this._level[index]
    const height = col[col.length - 1].getPosition().y - col[0].getPosition().y + mh + 4
    return { height, sy: col[0].getPosition().y - mh / 2, ey: col[col.length - 1].getPosition().y + mh / 2 }
  }

  static itemWidth(level, { i, n1, n2, w, h }) {
    const items = level[i]
    if (n1 && n1 <= 0) {
      return 'first'
    } else if (n1 && n1 >= items.length) {
      return 'last'
    }
    if (n2 && n2 >= items.length) {
      return 'last'
    } else if (n2 && n2 <= 0) {
      return 'first'
    }
    if (n1 !== 0 && !n1) n1 = 0
    if (n2 !== 0 && !n2) n2 = items.length - 1

    n1 = items[n1]
    n2 = items[n2]
    const b1 = n1.getDag().getMeta('wholeSize')
    const b2 = n2.getDag().getMeta('wholeSize')
    let sx = null
    let sy = null
    let ex = null
    let ey = null
    if (w) {
      sx = b1.sx
      ex = b2.sx + b2.w
    }
    if (h) {
      sy = b1.sy
      ey = b2.sy + b2.h
    }
    return { sx, sy, ex, ey, length: items.length }
  }
}

class DagNode {
  constructor(info) {
    this._initInfo(info)
  }

  _initInfo(info) {
    this.name = info.component_name
    this.status = info.status
    this.disable = info.disable
    this.time = info.time
    this.dataIndex = info.dataIndex
    this.model = info.model
  }

  _initChild(dep, instances) {
    for (const val of dep) {
      for (const ins of instances) {
        // Finding instance in dependency
        if (ins.name === val.component_name) {
          if (val.type === 'data') {
            if (!ins.node.dataChild) ins.node.dataChild = []
            ins.node.dataChild.push(this)
          } else if (val.type === 'model') {
            if (!ins.node.modelChild) ins.node.modelChild = []
            ins.node.modelChild.push(this)
          }
          break
        } else {
          if (ins.name === val) {
            if (!ins.node.dataChild) ins.node.dataChild = []
            ins.node.dataChild.push(this)
          }
        }
      }
    }
  }

  _initLevel(level) {
    if (!this.level) this.level = 0
    if (level > this.level) {
      this.level = level
      if (this.dataChild && this.dataChild.length > 0) {
        for (const data of this.dataChild) {
          data._initLevel(this.level + 1)
        }
      }
      if (this.modelChild && this.modelChild.length > 0) {
        for (const model of this.modelChild) {
          model._initLevel(this.level + 1)
        }
      }
    }
  }

  setInfo(info) {
    this._initInfo(info)
  }

  setDag(instance) {
    this._instance = instance
  }

  getDag() {
    return this._instance
  }

  setDependency(dep, instances) {
    this._initChild(dep, instances)
  }

  setPosition(x, y) {
    this.pos = {}
    this.pos.x = x
    this.pos.y = y
  }

  hasChild() {
    const ret = []
    if (this.dataChild && this.dataChild.length > 0) {
      ret.push(...this.dataChild)
    }
    if (this.modelChild && this.modelChild.length > 0) {
      ret.push(...this.modelChild)
    }
    return ret
  }

  getDataChild() {
    return this.dataChild
  }

  getModelChild() {
    return this.modelChild
  }

  getLevel() {
    return this._level
  }

  equal(node) {
    if (node.name === this.name) {
      return true
    }
    return false
  }
}

export default Dag
