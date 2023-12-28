import toMatch from './toMatch';

export default function toHour(date: Date | number | string) {
  return toMatch(date, (date: any) =>
    date instanceof Date ? date.getHours() : Math.floor(date / 3600)
  );
}
