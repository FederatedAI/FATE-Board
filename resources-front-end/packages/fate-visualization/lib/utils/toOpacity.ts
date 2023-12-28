/**
 * rgba 色源调整透明度
 * @param color 原色(rgba)
 * @param opacity 透明度
 * @returns 新色
 */
export default function toOpacity(color: string, opacity = 0) {
  if (color.match(/rgba?/)) {
    const rgba = color.match(/rgba?\((.+)\)/);
    if (rgba && rgba[1]) {
      const [r, g, b, a = 1] = rgba[1].split(',');
      return `rgba(${r},${g},${b},${opacity})`;
    }
  }
  return color;
}
