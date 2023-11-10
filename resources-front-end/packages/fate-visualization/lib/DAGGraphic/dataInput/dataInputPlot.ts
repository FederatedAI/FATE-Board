import Plot from '../Plot';
import position from '../position';
import configuration from './configuration';

export default class DataInputPlot<
  P extends object,
  A extends object,
  S extends object,
  E extends object,
> extends Plot<P, A, S, E> {
  position() {
    return position(this, ([x, y]: any) => {
      return [
        x + configuration.size.width / 2 + configuration.common.margin,
        y + configuration.size.height / 2 + configuration.common.margin,
      ];
    });
  }
}
