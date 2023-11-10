import toMatch from './toMatch';

export default function toMinute(date: Date | string | number) {
  return toMatch(date, (date: any) =>
    date instanceof Date ? date.getMinutes() : Math.floor(date / 60) % 60
  );
}
