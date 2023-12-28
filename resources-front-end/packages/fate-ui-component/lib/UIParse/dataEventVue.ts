import { capitalize, isString } from 'lodash';
import DataEvent from './AST/dataEvent';

export default class DataEventVue extends DataEvent {
  set(
    keyOrObj: string | object,
    value: unknown,
    norecord = false,
    unobser = false
  ) {
    if (isString(keyOrObj)) {
      keyOrObj = `on${capitalize(keyOrObj)}`;
    }
    super.set(<string>keyOrObj, value, norecord, unobser);
  }

  get(keyword: string) {
    return super.get(`on${capitalize(keyword)}`);
  }

  del(keyword: string, norecord = false, unobser = false): boolean {
    return super.del(`on${keyword}`, norecord, unobser);
  }
}
