import { debounce } from "lodash"

type ObserveOperation = (entries?: unknown) => void

export default function observeing (
  cb: ObserveOperation,
  init = true
) {
  const db = debounce(cb)
  const obs = new ResizeObserver(db)
  if (init) cb()
  return {
    observer: (dom: HTMLElement) => obs.observe(dom),
    unobserver: () => obs.disconnect()
  }
}
