export default function docRange (element: HTMLElement) {
  const Range = document.createRange()
  const FChild = element.firstChild
  const LChild = element.lastChild
  if (FChild && LChild) {
    Range.setStart(FChild, 0)
    Range.setEnd(LChild, LChild.nodeType === 3 ? (LChild as any).length : 1)
  } else {
    Range.selectNode(element)
  }
  const operation = {
    width: () => element.clientWidth,
    height: () => element.clientHeight,
    rect: () => Range.getBoundingClientRect(),
    ellipse: () => {
      const padding =
        parseFloat(element.style['paddingLeft'] || '0') +
        parseFloat(element.style['paddingRight'] || '0');
      return operation.rect().width + padding < operation.width() + 2
    }
  }
  return operation
}
