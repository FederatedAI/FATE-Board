import { createGradient } from '../basePath/gradient'

const CON_TO_DEGREE = 10
const DEGREE_DISTANCE = 5
const DEGREE_TO_NUM = 10
const NUM_TO_BOTTOM = 25
const LINE_TO_BOTTOM = 10
const LINE_STYLE = '#e8e8ef'

function drawContainer(ctx, start, radius, width, gra = true) {
  if (gra) {
    ctx.strokeStyle = createGradient(ctx, { x: start.x, y: start.y }, { x: start.x + width, y: start.y }, [{ pos: 0, color: 'rgba(73, 78, 206, 0.6)' }, { pos: 1, color: '#24b68b' }])
    ctx.lineWidth = 10
    ctx.lineCap = 'butt'
  } else {
    ctx.lineWidth = 2
    ctx.lineCap = 'butt'
    ctx.strokeStyle = LINE_STYLE
  }
  const s = Math.sin(Math.PI / 4)
  const c = Math.cos(Math.PI / 4)
  const x = start.x + s * radius
  const y = start.y + c * radius
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.arc(x, y, radius, 1.25 * Math.PI, 1.75 * Math.PI)
  ctx.stroke()
  return radius
}

function getPosition(sx, sy, degree, distance) {
  return {
    x: sx + distance * Math.sin(2 * Math.PI * (degree) / 360),
    y: sy + distance * Math.cos(2 * Math.PI * (degree) / 360)
  }
}

function drawDegree(ctx, bet = CON_TO_DEGREE, long = DEGREE_DISTANCE, toWord = DEGREE_TO_NUM, r, start, font) {
  const deg = 45
  let checkX = Math.sin(45 * 2 * Math.PI / 360) * r
  let checkY = Math.cos(45 * 2 * Math.PI / 360) * r
  let lx = start.x
  let ly = start.y
  for (let ind = 0; ind < 11; ind++) {
    (function() {
      const i = ind
      if (i !== 0) {
        const newCheckX = Math.sin((45 - i * 9) * 2 * Math.PI / 360) * r
        const newCheckY = Math.cos((45 - i * 9) * 2 * Math.PI / 360) * r
        lx += (checkX - newCheckX)
        ly += (checkY - newCheckY)
        checkX = newCheckX
        checkY = newCheckY
      }
      const cs = getPosition(lx, ly, deg - (i * 9), bet)
      const es = getPosition(cs.x, cs.y, deg - (i * 9), long)
      const ts = getPosition(es.x, es.y, deg - (i * 9), toWord)
      ctx.beginPath()
      ctx.moveTo(cs.x, cs.y)
      ctx.lineTo(es.x, es.y)
      ctx.strokeStyle = LINE_STYLE
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.textAlign = 'center'
      ctx.textBaseLine = 'middle'
      ctx.fillStyle = '#494ece'
      ctx.font = font + 'px Arial'
      ctx.fillText(i * 10, ts.x, ts.y)
    })()
  }
}

const path = function(ctx, state) {
  const { width, progress = 0, content = 'elapsad', time = '00:00:00' } = state
  const x = state.x || 0
  const r = (width - x * 2) / 2 / Math.sin(Math.PI / 4)
  const y = state.y || r - (width - x * 2) / 2 + 6
  drawContainer(ctx, { x, y }, r, width)
  drawDegree(ctx, CON_TO_DEGREE, DEGREE_DISTANCE, DEGREE_TO_NUM, r, { x, y }, 10)
  const distance = CON_TO_DEGREE + DEGREE_DISTANCE + DEGREE_TO_NUM + NUM_TO_BOTTOM
  drawContainer(ctx, { x: x + Math.sin(Math.PI / 4) * distance, y: y + Math.cos(Math.PI / 4) * distance }, r - distance, width - Math.sin(Math.PI / 4) * distance * 2, false)
  const degree = 90 * progress / 100
  const checkX = Math.sin(45 * 2 * Math.PI / 360) * r
  const checkY = Math.cos(45 * 2 * Math.PI / 360) * r
  let fx = x
  let fy = y
  const newCheckX = Math.sin((45 - degree) * 2 * Math.PI / 360) * r
  const newCheckY = Math.cos((45 - degree) * 2 * Math.PI / 360) * r
  fx += checkX - newCheckX
  fy += checkY - newCheckY
  const slp = getPosition(fx, fy, (45 - degree), distance - LINE_TO_BOTTOM)
  const elp = getPosition(slp.x, slp.y, (45 - degree), 30)
  ctx.beginPath()
  ctx.moveTo(slp.x, slp.y)
  ctx.lineTo(elp.x, elp.y)
  ctx.strokeStyle = '#494ece'
  ctx.lineWidth = 1
  ctx.stroke()

  const contentX = x + Math.sin(Math.PI / 4) * r
  const contentY = y + Math.cos(Math.PI / 4) * distance - 14
  ctx.fillStyle = '#bbbbc8'
  ctx.font = '13px Lato'
  ctx.textAlign = 'center'
  ctx.textBaseLine = 'middle'
  ctx.fillText(content, contentX, contentY)

  const timeX = contentX
  const timeY = contentY + 14 + 4
  ctx.fillStyle = '#494ece'
  ctx.font = '16px Lato'
  ctx.fillText(time, timeX, timeY)

  const progressX = contentX
  const progressY = timeY + 16 + 16 + 18
  const progresses = Math.round(progress) + '%'
  ctx.fillStyle = '#494ece'
  ctx.font = 'bold 36px Lato'
  ctx.fillText(progresses, progressX, progressY)
}

function clear(ctx, state) {
  const layer = this
  ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
}

const animations = [
  {
    name: 'tiktok',
    callback: function(state) {
      const layer = this
      let s = state.time || '00:00:00'
      s = s.split(':')
      s[2] = parseInt(s[2]) + 1
      if (s[2] >= 60) {
        s[2] = 0
        s[1] = parseInt(s[1]) + 1
      }
      if (s[1] >= 60) {
        s[1] = 0
        s[0] = parseInt(s[0]) + 1
      }
      if (parseInt(s[2]) < 10) {
        s[2] = '0' + parseInt(s[2])
      }
      if (parseInt(s[1]) < 10) {
        s[1] = '0' + parseInt(s[1])
      }
      if (parseInt(s[0]) < 10) {
        s[0] = '0' + parseInt(s[0])
      }
      layer.setStates({ time: s.join(':') })
    },
    time: 1000
  }
]

const events = [
  {
    type: 'loading',
    callback: function(meta, check, pos, state, params) {
      const layer = this
      const change = function() {
        if (state.progress < params) {
          state.progress += 0.25
        } else {
          return false
        }
      }
      // layer.getAniamtion('loading')
      layer.addAnimation('loading', change)
    }
  }
]

const panel = { path, animations, events, clear }

export { panel }
