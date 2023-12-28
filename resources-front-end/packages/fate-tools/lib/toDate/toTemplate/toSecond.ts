import toMatch from './toMatch';

export default function toSecond(date: Date | number | string) {
  return toMatch(date, (date: any) =>
    date instanceof Date ? date.getSeconds() : date % 60
  );
}
