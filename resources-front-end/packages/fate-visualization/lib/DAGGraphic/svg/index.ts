import { svg } from 'd3';
import complete from './complete.svg';
import disableComplete from './disable_complete.svg';
import disableError from './disable_error.svg';
import error from './error.svg';
import lock from './lock.svg';

const svgs: any = {};
let isLoading: any;

export function SVGLoading() {
  if (!isLoading) {
    isLoading = Promise.all([
      svg(complete).then(
        (content: any) => (svgs.complete = content.children[0])
      ),
      svg(disableComplete).then(
        (content: any) => (svgs.discomplete = content.children[0])
      ),
      svg(error).then(
        (content: any) => (svgs.error = content.children[0])
      ),
      svg(disableError).then(
        (content: any) => (svgs.diserror = content.children[0])
      ),
      svg(lock).then(
        (content: any) => (svgs.lock = content.children[0])
      ),
    ]);
    return isLoading;
  }
  return Promise.resolve();
}

export function SVGs(): any {
  if (Object.keys(svgs).length <= 0) {
    SVGLoading();
  }
  return svgs;
}
