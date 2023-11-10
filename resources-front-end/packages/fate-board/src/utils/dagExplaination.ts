import store from '@/store/store';
import { cloneDeep, debounce } from "lodash";

export default debounce(async (data: any, cb: any) => {
  if (data && data.component_list) {
    const origin: any = cloneDeep(data);
    for (const key in origin.component_list) {
      const each = origin.component_list[key];
      each.name = each.component_name;
      each.duration = each.time;

      const type = origin.component_module[each.name];
      const portsConfig = await store.dispatch('portConfig', type);
      const role = store.state.job.role;
      const stage = origin.component_stage
        ? origin.component_stage[each.name]
        : 'default';

      const ports: any = {};
      for (const key in portsConfig) {
        if (Array.isArray(portsConfig[key])) {
          ports[key] = [];
          for (const eachPort of portsConfig[key]) {
            if (
              eachPort.roles.some((item: string) => item === role) &&
              (eachPort.stages.some((item: any) => item === stage) ||
                eachPort.stages.some((item: any) => item === 'default') ||
                eachPort.stages.length === 0 ||
                !eachPort.stages[0])
            ) {
              ports[key].push(eachPort);
            }
          }
        } else {
          ports[key] = portsConfig[key];
        }
      }
      Object.assign(each, ports);
    }
    cb(origin);
  }
}, 400);