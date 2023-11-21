export default function stretch (charts: any) {
  const elesArr = Array.from(new Set(charts._chartsViews[0]._data._graphicEls))
  const dep = charts._chartsViews[0]._data.tree.root.height
  const layer_height = 150
  const currentHeight = layer_height * (dep + 1) || (layer_height)
  const newHeight = Math.max(currentHeight, layer_height)
  const layer_width = 120
  const currentWidth = layer_width * (elesArr.length - 1) || layer_width
  const newWidth = Math.max(currentWidth, layer_width)
  return {
    width: newWidth,
    height: newHeight
  }
}
