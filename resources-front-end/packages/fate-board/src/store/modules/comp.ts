import API from '@/api';
import transform from '@/transform';
import { parse } from 'fate-ui-component';
import { isObject, isString } from 'lodash';

const objectExplain = (data: any): any[] => {
  let uuid = 0;
  const each = (origin: any, upper = '') => {
    let result: any = {
      id: uuid,
      label: upper,
    };
    uuid++;
    const keyTo = upper ? upper + ':' : '';
    if (isObject(origin)) {
      if (Array.isArray(origin)) {
        result.label = `${keyTo} [${origin
          .map((item: string) =>
            item === undefined
              ? 'undefined'
              : item === null
              ? 'null'
              : item === ''
              ? "''"
              : item.toString()
          )
          .join(', ')}]`;
      } else if (Object.keys(origin).length === 0) {
        result.label = `${keyTo} {}`;
      } else {
        result.children = [];
        for (const key in origin) {
          const value = (origin as any)[key];
          result.children.push(each(value, key));
        }
      }
    } else if (origin === undefined) {
      result.label = `${keyTo} undefined`;
    } else if (origin === null) {
      result.label = `${keyTo} null`;
    } else if (origin === '') {
      result.label = `${keyTo} ''`;
    } else {
      result.label = `${keyTo} ${
        isString(origin) ? origin : origin.toString()
      }`;
    }
    return upper ? result : result.children || [];
  };
  return each(data);
};

export default {
  state: {
    information: {},
    parameters: {},
    model: {},
    metrics: {},
    hasLoaded: {},
  },

  mutations: {
    SET_INFORMATION(state: any, information: any) {
      state.information = information;
    },

    SET_PARAMETER(state: any, parameters: any) {
      state.parameters = parameters;
    },

    SET_MODEL(state: any, model: any) {
      state.model = model;
    },

    SET_METRIC(state: any, metrics: any) {
      state.metrics = metrics;
    },

    SET_HASLOADED(state: any, param: any) {
      Object.assign(state.hasLoaded, param);
    },
  },

  actions: {
    async chooseComp({ state, commit, dispatch }: any, comp: any) {
      commit('SET_INFORMATION', comp);
      await dispatch('parameterRequest');
      await dispatch('modelRequest');
      await dispatch('metricRequest');
      const jobId = await dispatch('GET_JOBID')
      const partyId = await dispatch('GET_PARTYID')
      const role = await dispatch('GET_JOB_ROLE')
      const component = state.information.name
      const type = state.information.type
      if (component && !state.hasLoaded[component]) {
        const configuration: any = transform(state.model, state.metrics, role, partyId, component, type, jobId);
        const instance = await parse(configuration, undefined, <any>({ replace: true }))
        commit('SET_HASLOADED', {
          [component]: Object.freeze({
            parameters: state.parameters,
            instance
          })
        })
      }
    },

    async parameterRequest({ state, commit, dispatch }: any) {
      try {
        let parameters
        if (!state.hasLoaded[state.information.name] || !state.hasLoaded[state.information.name].parameters) {
          const job_id = await dispatch('GET_JOBID');
          const party_id = await dispatch('GET_PARTYID');
          const role = await dispatch('GET_JOB_ROLE');
          const responseData = await API.getComponentPara({
            job_id,
            party_id,
            role,
            component_name: state.information.name,
          });
          const responseParam = JSON.parse(responseData);
          parameters = objectExplain(responseParam);
        } else {
          parameters = state.hasLoaded[state.information.name].parameters
        }
        commit('SET_PARAMETER', parameters);
        return parameters;
      } catch (err) {
        return [];
      }
    },

    async modelRequest({ state, commit, dispatch }: any) {
      try {
        if (!state.hasLoaded[state.information.name] || !state.hasLoaded[state.information.name].configuration) {
          const job_id = await dispatch('GET_JOBID');
          const party_id = await dispatch('GET_PARTYID');
          const role = await dispatch('GET_JOB_ROLE');
          const responseData = await API.getModelOutput({
            job_id,
            party_id,
            role,
            component_name: state.information.name,
          });
          commit('SET_MODEL', responseData);
        }
      } catch (err) {
        return {};
      }
    },

    async metricRequest({ state, commit, dispatch }: any) {
      try {
        if (!state.hasLoaded[state.information.name] || !state.hasLoaded[state.information.name].configuration) {
          const job_id = await dispatch('GET_JOBID');
          const party_id = await dispatch('GET_PARTYID');
          const role = await dispatch('GET_JOB_ROLE');
          const responseData = await API.getMetrics({
            job_id,
            party_id,
            role,
            component_name: state.information.name,
          });
          commit('SET_METRIC', responseData);
        }
      } catch (err) {
        return {};
      }
    },

    setLoader({ state, commit }: any, instance: any) {
      const name = state.information.name;
      if (name) {
        commit('SET_HASLOADED', {
          [name]: instance,
        });
      }
    },

    getLoaded({ state }: any) {
      const name = state.information.name;
      return state.hasLoaded[name];
    },

    clearLoaded({ state }: any) {
      state.hasLoaded = {}
      state.information = {}
      state.parameters = {}
      state.model = {}
      state.metrics = {}
    },

    async dataOutput ({ state, dispatch}: any) {
      const job_id = await dispatch('GET_JOBID');
      const party_id = await dispatch('GET_PARTYID');
      const role = await dispatch('GET_JOB_ROLE');
      const component_name = state.information.name
      return await API.getDataOutput({
        job_id, party_id, role, component_name
      })
    },

    getComponentName ({ state }: any) {
      return  state.information.name
    }
  },
};
