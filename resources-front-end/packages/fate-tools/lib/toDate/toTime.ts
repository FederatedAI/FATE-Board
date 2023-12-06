import toTemp from './toTemplate';

export default function toTime(
  date: number, // ms
  template = 'h:m:s'
) {
  return toTemp(template, Math.floor(date / 1000));
}
