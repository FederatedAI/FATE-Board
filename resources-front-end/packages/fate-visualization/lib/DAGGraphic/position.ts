import Plot from './Plot';

export default function position(plot: any, cb?: any): number[] {
  const x = Number(plot.dom.attr('x') || 0);
  const y = Number(plot.dom.attr('y') || 0);
  if (plot.parent instanceof Plot) {
    const [rx, ry] = position(plot.parent);
    return cb ? cb([rx + x, ry + y]) : [rx + x, ry + y];
  } else if (plot.parent) {
    const rx = Number((plot.parent as any).attr('x') || 0);
    const ry = Number((plot.parent as any).attr('y') || 0);
    return cb ? cb([rx + x, ry + y]) : [rx + x, ry + y];
  } else {
    return cb ? cb([x, y]) : [x, y];
  }
}
