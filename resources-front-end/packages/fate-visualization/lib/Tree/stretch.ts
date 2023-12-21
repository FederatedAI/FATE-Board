export default function stretch (charts: any) {
  let elesArr = Array.from(new Set(charts._chartsViews[0]._data._graphicEls))
  let dep = charts._chartsViews[0]._data.tree.root.height
  let layer_height = 100
  let currentHeight = layer_height * (dep + 1) || (layer_height)
  let newHeight = Math.max(currentHeight, layer_height)
  let layer_width = 140
  let currentWidth = layer_width * (elesArr.length - 1) || layer_width
  let newWidth = Math.max(currentWidth, layer_width)
  return {
    width: newWidth,
    height: newHeight
  }
}