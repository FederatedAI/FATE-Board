import Plot from '../Plot';
import position from '../position';
import configuration from './configuration';

export default class StagePlot<
  P extends object,
  A extends object,
  S extends object,
  E extends object,
> extends Plot<P, A, S, E> {
  position() {
    return position(this, ([x, y]: any) => {
      return [
        x + configuration.body.size.stageCircle / 2,
        y + configuration.body.size.stageCircle / 2,
      ];
    });
  }
}
