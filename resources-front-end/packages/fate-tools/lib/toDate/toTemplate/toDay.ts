import toMatch from './toMatch';

export default function toDay(date: Date | number | string) {
  return toMatch(date, (date: any) => date.getDay());
}
