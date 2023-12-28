import Plot, { PlotCommon } from './Plot';

export default function parse(options: any, parent: any) {
  const children = options.children;
  delete options.children;
  options.parent = parent;
  const creator = options.creator;
  const newPlot: PlotCommon = creator ? creator(options) : new Plot(options);
  if (children) {
    for (const child of children) {
      parse(child, newPlot);
    }
  }
  return newPlot;
}
