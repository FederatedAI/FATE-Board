export default function toLegend(data: string[]) {
  return {
    type: 'scroll',
    orient: 'horizontal',
    right: 10,
    top: 20,
    bottom: 20,
    data,
  };
}
