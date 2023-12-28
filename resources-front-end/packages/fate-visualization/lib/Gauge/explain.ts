import { merge } from "lodash";
import series from './series';

export default function explain () {
  return merge({}, series())
}