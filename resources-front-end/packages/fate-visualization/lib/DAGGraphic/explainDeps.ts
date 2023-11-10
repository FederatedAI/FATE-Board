import measureText from '@/utils/measureText';
import configuration from './component/configuration';
import inputConfiguration from './dataInput/configuration';
import explainPort from './portImply';
import runningStage from './runningStage';
import runningStatus from './runningStatus';

const RandomBet = 50


export default function explainDependencies(data: any, containerWidth: number) {
  const CCB = configuration.body;
  const comps = new Map<string, object>();
  const links: any[] = [];

  for (const each of data.component_list) {
    const compId = each.component_name;
    const txWidth = Number(
      measureText(
        compId,
        configuration.common.fontSize,
        configuration.common.fontFamily
      ) || 260
    );
    const width = Math.max(
      Number(
        (txWidth + CCB.size.leftPadding + CCB.size.rightPadding).toFixed(2)
      ),
      CCB.size.minWidth
    );
    const height = Number(
      (
        configuration.common.fontSize +
        CCB.size.topPadding +
        CCB.size.bottomPadding
      ).toFixed(2)
    );

    const comp = Object.assign(
      {
        DisplayAs: 'component',
        name: compId,
        status: runningStatus(each.status),
        type: data?.component_module
          ? data?.component_module[compId]
          : 'reader',
        disable: data?.component_need_run
          ? !data?.component_need_run[compId]
          : true,
        stage: runningStage(
          data?.component_stage ? data?.component_stage[compId] : undefined
        ),

        width,
        height,
        txWidth,

        level: 1,
        input: each.input,
        output: each.output
      },
      (!each.input && !each.output) ? explainPort(data.component_module[compId]) : {}
    );
    comps.set(compId, comp);
  }

  const setLevel = (from: string, end: string) => {
    const fromCompInstance = comps.get(from);
    const toCompInstance = comps.get(end);
    if (toCompInstance && fromCompInstance) {
      (toCompInstance as any).level < (fromCompInstance as any).level + 1;
      (toCompInstance as any).level = (fromCompInstance as any).level + 1;
    }
    if (linksForLevels[end]) { 
      for (const each of linksForLevels[end]) {
        setLevel(end, each.toComp)
      }
    }
  }
  const linksForLevels: any = {}
  for (const compId in data.dependencies) {
    const deps = data.dependencies[compId];
    for (const dep of deps) {
      if (!dep.component_name) {
        comps.set(dep.name, Object.assign({
          DisplayAs: 'dataInput',
          tooltip: dep.name,
          level: 1, 
          width: inputConfiguration.size.width,
          height: inputConfiguration.size.height
        }, dep))
      }
      const link = {
        fromComp: dep.component_name || dep.name,
        from: dep.component_name ? (() => {
          const type = dep?.up_output_info[0] || dep.type;
          const cursor = dep?.up_output_info[1] || 0
          return [`${[type,
            type.match(/data/i) ? 'data' : 'model', 
            dep.type].join('|')}`, cursor];
        })() : dep.name,
        toComp: compId,
        to: `${dep.type}`,
      };
      setLevel(dep.component_name || dep.name, compId)

      // to level calculate
      if (!linksForLevels[dep.component_name]) linksForLevels[dep.component_name] = []
      linksForLevels[dep.component_name].push(link)
      
      links.push(link);
    }
  }

  const levels: any[] = [];
  for (const [, comp] of comps) {
    const cursor = (comp as any).level;
    if (!levels[cursor - 1]) levels[cursor - 1] = [];
    levels[cursor - 1].push(comp);
  }

  let fromy = 50;
  for (const level of levels) {
    const countWidth = level.reduce(
      (pre: number, value: object) => pre + (value as any).width + 100 + 10,
      0
    );
    let startx = (containerWidth - countWidth) / 2 + Number((Math.random() * RandomBet - RandomBet / 2).toFixed(2));

    for (const comp of level) {
      comp.x = startx + (comp.width + 110) / 2;
      comp.y = fromy + (comp.height + 6) / 2;

      startx += (comp as any).width + 110 + 10;
      fromy += (comp.height + 6) / 2;
    }
    fromy += 100;
  }

  return {
    comps,
    links,
    levels,
  };
}
