import Plot from '../Plot';
import position from '../position';
import configuration from './configuration';

export default class PortPlot<
  P extends object,
  A extends object,
  S extends object,
  E extends object,
> extends Plot<P, A, S, E> {
  position() {
    return position(this, ([x, y]: any) => {
      return [
        x + configuration.port.content.width / 2,
        y + configuration.port.content.height / 2,
      ];
    });
  }
}
