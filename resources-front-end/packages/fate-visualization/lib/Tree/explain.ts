import { merge } from "lodash-es";
import series from './series';
import tooltip from './tooltip';

export default function treeExplain (data: any, ext?: object) {
  return merge({}, tooltip(), series(data), ext || {}) 
}