import toDay from './toDay';
import toHour from './toHour';
import toMinute from './toMinute';
import toMonth from './toMonth';
import toSecond from './toSecond';
import toYear from './toYear';

export default function toTemp(template: string, date: Date | number | string) {
  let result = template;
  if (template.match('Y')) {
    result = result.replace(/Y+/, toYear(<Date>date));
  }
  if (template.match('M')) {
    result = result.replace(/M+/, toMonth(<Date>date));
  }
  if (template.match('D')) {
    result = result.replace(/D+/, toDay(<Date>date));
  }
  if (template.match('h')) {
    result = result.replace(/h+/, toHour(date));
  }
  if (template.match('m')) {
    result = result.replace(/m+/, toMinute(date));
  }
  if (template.match('s')) {
    result = result.replace(/s+/, toSecond(date));
  }
  return result;
}
