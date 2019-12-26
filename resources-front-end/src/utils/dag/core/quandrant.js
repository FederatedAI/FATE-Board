
const FIRST_QUADRANT = 'first_quadrant'
const SECOND_QUADRANT = 'second_quadrant'
const THRID_QUADRANT = 'thrid_quadrant'
const FOURTH_QUADRANT = 'fourth_quadrant'

function quadrant(d, callback) {
  d = d % 360
  if (d >= 0 && d < 90) {
    callback(this.FIRST_QUADRANT)
    return this.FIRST_QUADRANT
  } else if (d >= 90 && d < 180) {
    callback(this.SECOND_QUADRANT)
    return this.SECOND_QUADRANT
  } else if (d >= 180 && d < 270) {
    callback(this.THRID_QUADRANT)
    return this.THRID_QUADRANT
  } else if (d >= 270 && d < 360) {
    callback(this.FOURTH_QUADRANT)
    return this.FOURTH_QUADRANT
  }
}

export default { FIRST_QUADRANT, SECOND_QUADRANT, THRID_QUADRANT, FOURTH_QUADRANT, quadrant }
