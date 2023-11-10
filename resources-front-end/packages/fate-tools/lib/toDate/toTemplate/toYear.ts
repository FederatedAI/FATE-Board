import toMatch from './toMatch';

export default function toYear(date: Date) {
  return toMatch(date, (date: any) => date.getFullYear(), 4);
}
