import { zoom, zoomIdentity, zoomTransform } from 'd3';
import component from './component';
import startInput from './dataInput';
import explainDependencies from './explainDeps';
import linking from './linking';
import { EventCallback, PlotCommon } from './Plot';
import tooltip from './tooltip';

interface DataOptions {
  width?: number;
  height?: number;
  data?: object;
}

interface EventOptions {
  choose: EventCallback;
  retry: EventCallback;
}

interface DAGParameter {
  data: DataOptions;
  event: EventOptions;
}

export default class DAG {
  protected component: Map<string, PlotCommon> = new Map();
  protected linking: Map<string, PlotCommon> = new Map();
  protected tooltip?: PlotCommon;

  protected container: any;
  protected mark: any;
  protected resizeObserve: any;
  protected zoomInstance: any;
  protected zoomRelative: any;

  protected connection: any

  containerWidth: number = 0;
  containerHeight: number = 0;

  // containerTransition = {
  //   x: 0,
  //   y: 0,
  //   k: 1,
  // };
  zoomMin = 0.1;
  zoomMax = 3;
  // containerTranform = throttle((attrs: any) => {
  //   this.container.attr(
  //     'transform',
  //     attrs || `translate(${this.containerTransition.x} ${this.containerTransition.y}) scale(${this.containerTransition.k})`
  //   );
  // }, 50);

  event: EventOptions;
  parent: any;

  constructor({ data, event }: DAGParameter, parent: any) {
    this.event = event;
    this.parent = parent;
    this.$parent();
    this.$container();
    this.$init(data);
    this.$zoom();
  }

  protected $parent() {
    const size = () => {
      const node = this.parent?.node() || this.parent;
      this.containerWidth = node.clientWidth;
      this.containerHeight = node.clientHeight;
    };
    size();
    this.resizeObserve = new ResizeObserver((entries: any) => {
      const { width, height } = entries[0].contentRect;
      if (
        Math.abs(width - this.containerWidth) > 10 ||
        Math.abs(height - this.containerHeight) > 10
      ) {
        size();
        this.container
          .attr('width', this.containerWidth)
          .attr('height', this.containerHeight);
      }
    });
    this.resizeObserve.observe(this.parent?.node() || this.parent);
  }

  protected $container() {
    this.container = this.parent
      .append('svg')
      .attr('id', 'dag_container')
      .attr('overflow', 'visible')
      .attr('width', this.containerWidth)
      .attr('height', this.containerHeight);
  }

  protected $zoom() {
    this.zoomRelative = this.centerForParent()
    this.zoomInstance = zoom()
      .scaleExtent([this.zoomMin, this.zoomMax])
      .on('zoom', () => {
        this.container.attr(
          'transform', zoomTransform(this.container.node()))
      });
    this.parent.call(this.zoomInstance).on('dblclick.zoom', null);
  }

  protected centerForParent () {
    return [
      this.parent.node().clientWidth / 2,
      this.parent.node().clientHeight / 2
    ]
  }

  zoomIn(times?: number) {
    const transform = zoomIdentity.scale(times || 0.95)
    this.parent.transition().call(this.zoomInstance.transform, transform)
  }

  zoomOut(times?: number) {
    const transform = zoomIdentity.scale(times || 1.05)
    this.parent.transition().call(this.zoomInstance.transform, transform)
  }

  protected $init(data: any) {
    const { comps, links } = explainDependencies(data, this.containerWidth);
    this.connection = links
    for (const [, comp] of comps) {
      this.addComponent(comp);
    }
    for (const link of links) {
      this.addLinking(link);
    }
  }

  protected unChoose (except?: PlotCommon) {
    for (const [, comp] of this.component) {
      let root = undefined
      if (except) {
        root = except.rootPlot();
      }
      if (!root || comp.id !== root.id) {
        comp.dispatchDeep('unrelative');
        comp.dispatchDeep('unchoose');
      }
    }
    for (const [, link] of this.linking) {
      let root = undefined
      if (except) {
        root = except.rootPlot();
      }
      if (!root || link.id !== root.id) {
        link.dispatchDeep('unrelative');
        link.dispatchDeep('unchoose');
      }
    }
  }

  chooseWhole () {
    this.unChoose()
  }

  addComponent(prop: any) {
    if (prop.DisplayAs === 'component') {
      const newComp = component(
        {
          prop: <any>prop,
          attr: {},
          event: <any>{
            choose: (event: any, plot: PlotCommon) => {
              
              this.unChoose(plot)
              this.event.choose && this.event.choose(event, plot);
              let connected: any
              if (this.connection) {
                const root = plot.rootPlot()
                connected = this.connection.reduce((pre: any, item: any) => {
                  if (item.fromComp === root.id || item.toComp === root.id) {
                    pre.push(item)
                  }
                  return pre
                }, [])
              }
              if (connected.length > 0) {
                for (const each of connected) {
                  const info = this.getConnection(each)
                  if (info) {
                    const { fromComp, toComp, fromPort, toPort} = info
                    if (fromComp.id !== plot.id) {
                      fromComp.dispatchDeep('relative');
                    }
                    if (toComp.id !== plot.id) {
                      toComp.dispatchDeep('relative');
                    }
                    const link = this.linking.get(`${fromComp.id}_${toComp.id}_${fromPort.id}_${toPort.id}`)
                    if (link) {
                      link.dispatchDeep('relative')
                    }
                  }
                }
              }
            },
            retry: (event: any, plot: PlotCommon) => {
              this.event.retry && this.event.retry(event, plot);
            },
            overPort: (_event: any, plot: PlotCommon) => {
              this.removeTooltip();
              const [x, y] = (plot as any).position();
              this.addTooltip({
                content: plot.prop.tooltip,
                x,
                y,
                direction: plot.prop.direction.match(/input/i) ? 'up' : 'down',
              });
            },
            outPort: () => {
              this.removeTooltip();
            },
            overStage: (_event: any, plot: PlotCommon) => {
              this.removeTooltip();
              const [x, y] = (plot as any).position();
              this.addTooltip({
                content: `stage: ${plot.prop.stage}`,
                x,
                y,
              });
            },
            outStage: () => {
              this.removeTooltip();
            },
          },
        },
        this.container
      );
      this.component.set(newComp.id, newComp);
    } else if (prop.DisplayAs === 'dataInput') {
      const newComp = startInput(
        {
          prop,
          attr: {},
          event: <any>{
            overInput: (_event: any, plot: PlotCommon) => {
              this.removeTooltip();
              const [x, y] = (plot as any).position();
              this.addTooltip({
                content: plot.prop.tooltip,
                x,
                y,
                direction: 'up',
              });
            },
            outInput: () => {
              this.removeTooltip();
            },
          },
        },
        this.container
      );
      this.component.set(newComp.id, <any>newComp);
    }
  }

  removeComponent(name: string) {
    const comp = this.component.get(name);
    const prop = comp?.prop;
    comp?.release();
    return prop;
  }

  protected getConnection (prop: any): any {
    const fromComp = this.component.get(prop.fromComp);
    const toComp = this.component.get(prop.toComp);
    if (!fromComp || !toComp) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Linking parameter error (no such component)');
      }
      return void 0;
    }
    const fromPort = (() => {
      let port: any;
      if (Array.isArray(prop.from)) {
        const [imply, cursor] = prop.from;
        const toFind = imply.split('|');
        for (const str of toFind) {
          const comps = fromComp.findAll(
            (props: any) =>
              props.direction &&
              props.direction.match(/output/i) &&
              props.name &&
              props.name.match(new RegExp(str, 'i'))
          );
          if (comps[cursor]) {
            port = comps[cursor];
            break;
          }
        }
        return port;
      } else {
        return fromComp;
      }
    })();
    const toPort = toComp.find(
      (props: any) => props.name && props.name.match(new RegExp(prop.to, 'i'))
    );
    if (!fromPort || !toPort) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Linking parameter error (no such port)');
      }
      return void 0;
    }
    return {
      fromComp,
      toComp,
      fromPort,
      toPort
    }
  }

  addLinking(prop: any) {
    const info = this.getConnection(prop)
    if (!info) return void 0
    const { fromComp, toComp, fromPort, toPort} = info
    const startPosition = fromPort.position();
    const endPosition = toPort.position();

    const newlink = linking(
      {
        prop: <any>{
          name: `${fromComp.id}_${toComp.id}_${fromPort.id}_${toPort.id}`,
          from: startPosition,
          end: endPosition,
        },
        attr: {},
        event: <any>{},
      },
      this.container
    );
    this.linking.set(newlink.id, newlink);
  }

  removeLinking(name: string) {
    const link = this.linking.get(name);
    const prop = link?.prop;
    link?.release();
    return prop;
  }

  addTooltip(options: any) {
    this.tooltip = tooltip(
      {
        prop: options,
        attr: {},
        event: <any>{},
      },
      this.container
    );
  }

  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.release();
      this.tooltip = undefined;
    }
  }

  setStatus(name: string, status: string, duration: number) {
    const comp = this.component.get(name);
    if (comp) {
      const tiktok = comp.find('tiktok');
      if (tiktok) {
        tiktok.setProp('duration', duration);
      }
      comp.dispatchDeep('status', status);
    }
  }

  release() {
    for (const [, comp] of this.component) {
      comp.release();
    }
    for (const [, link] of this.linking) {
      link.release();
    }
    if (this.resizeObserve) {
      this.resizeObserve.disconnect();
    }
    if (this.container) {
      this.container.remove();
    }
    if (this.mark) {
      this.mark.remove();
    }
  }
}
