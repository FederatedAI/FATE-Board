/**
 * 数据统一转换为数组
 * @param arr 原数据
 * @returns 数组
 */
export default function toArray(...arr: unknown[]): unknown[] {
  return [...arr].flat(Infinity);
}
