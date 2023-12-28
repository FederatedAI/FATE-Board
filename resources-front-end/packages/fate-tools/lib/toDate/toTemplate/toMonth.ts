import toMatch from './toMatch';

export default function toMonth(date: Date | number | string) {
  return toMatch(date, (date: any) => date.getMonth() + 1);
}
