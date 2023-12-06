import { FCountTable } from '@/components/CountTable';
import { FSplitTable } from '@/components/SplitTable';
import { isUndefined } from 'lodash';
import fixed from '../tools/fixed';
import getModelData from '../tools/getModelData';
import sort from '../tools/sort';
import { toColumn } from '../tools/toTable';

export default function hetero_feature_binning(
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const binningModel = getModelData(modelData)

  const { data, meta } = binningModel.output_model
  const isGuest = role.match(/guest/i)
  const isHost = role.match(/host/i)

  // binning count table
  const BinningCountTable = (
    data: any
  ) => {
    const CountTableHeader = [
      toColumn('Variable', 'variable'),
      toColumn('Binning Count', 'binning_count'),
    ]
    if (isHost) {
      CountTableHeader.splice(1, 0, toColumn('Anonym In Guest', 'anonym'))
    }
    if (isGuest) {
      CountTableHeader.push(...[
        toColumn('IV', 'iv', { sortable: true }),
        toColumn('Monotocity', 'monotocity', { sortable: true })
      ])
    }
    const { metrics_summary, host_metrics_summary, bin_col, bin_count_dict } = data
    const { column_anonymous_map } = meta
    const configuration: any = {}

    // xxx_metrics_summary explain
    const createOneOptions = (summary: any, cols?: string[]) => {
      let tData: any = {}
      const options = []
      const explainOption = (summary: any) => {
        const data: any = []
        const { iv, is_monotonic, event_count } = summary
        for (const key in iv) {
          data.push({
            variable: key,
            binning_count: Object.keys(event_count[key]).length,
            iv: fixed(iv[key]),
            monotocity: is_monotonic[key]
          })
        }
        return data
      }
      if (cols) {
        for (const name of cols) {
          options.push({
            label: name,
            value: name
          })
          if (!tData[name]) tData[name] = []
          const usableData = summary[name]
          tData[name].push(...explainOption(usableData))
          tData[name] = sort(tData[name], 'variable')
        }
      } else {
        tData = explainOption(summary)
        tData = sort(tData, 'variable')
      }
      const result: any = {
        data: tData
      }
      if (options.length > 0) {
        result.options = options
      }
      return result
    }

    // host explain
    const createOneOptionsForHost = (anony:any, binCount: any, cols: string[]) => {
      const tData = sort(cols.map((variable: string) => {
        return {
          variable,
          iv: 0,
          binning_count: binCount[variable],
          anonym: anony?.[variable]
        }
      }), 'variable')
      return {
        data: tData
      }
    }

    // guest
    configuration['guest'] = isGuest ? createOneOptions(metrics_summary) : createOneOptionsForHost(column_anonymous_map, bin_count_dict, bin_col)

    // host
    if (isGuest) {
      configuration['host'] = createOneOptions(host_metrics_summary, Object.keys(host_metrics_summary))
    }

    return {
      id: 'BinningCountTable',
      tag: FCountTable,
      prop: {
        header: CountTableHeader,
        data: configuration,
        class: 'f-d-container'
      }
    }
  }

  const SplitTable = (
    data: any
  ) => {
    const SplitMaskTableHeader = [
      toColumn('Binning', 'binning'),
    ]
    if (isHost) {
      SplitMaskTableHeader.splice(1, 0, toColumn('Anonym In Guest', 'anonym'))
    }
    if (isGuest) {
      SplitMaskTableHeader.push(...[
        toColumn('IV', 'iv'),
        toColumn('WOE', 'woe'),
        toColumn('Event Count', 'event_count'),
        toColumn('Event Ratio', 'event_ratio'),
        toColumn('Non Event Count', 'non_event_count'),
        toColumn('Non Event Ratio', 'non_event_ratio')
      ])
    }
    const { metrics_summary, host_metrics_summary, bin_col, split_pt_dict } = data
    const configuration: any = {}

    const createOneOptions = (summary: string, split: any, cols: any) => {
      let tData: any = {}
      const options = []
      let subOptions: any
      const explainOption = (summary: any, pre: any) => {
        const data: any = {}
        const { iv_array, event_count, event_rate, non_event_count, non_event_rate, woe } = summary

        // sub Options
        if (!subOptions) subOptions = {}
        subOptions[pre] = Object.keys(event_count).map((item: string) => {
          return {
            label: item,
            value: item
          }
        })

        for (const each of subOptions[pre]) {
          data[each.value] = []
          for (const key in event_count[each.value]) {
            data[each.value].push({
              binning: (() => {
                if (split && split[each.value]) {
                  const cursor = parseInt(key)
                  if (isUndefined(event_count[each.value][cursor + 1])) {
                    return `${each.value} > ${fixed(split[each.value][cursor + 1])}`
                  } else if (cursor === 0) {
                    return `${each.value} <= ${fixed(split[each.value][cursor + 1])}`
                  } else {
                    return `${fixed(split[each.value][cursor])} < ${each.value} <= ${fixed(split[each.value][cursor + 1])}`
                  }
                } else {
                  return `bin_${key}`
                }
              })(),
              anonym: `bin_${key}`,
              iv: fixed(iv_array[each.value][key]),
              woe: fixed(woe[each.value][key]),
              event_count: fixed(event_count[each.value][key]),
              event_ratio: fixed(event_rate[each.value][key] * 100) + '%',
              non_event_count: fixed(non_event_count[each.value][key]),
              non_event_ratio: fixed(non_event_rate[each.value][key] * 100) + '%'
            })
          }
        }
        return data
      }
      if (Array.isArray(cols)) {
        for (const name of cols) {
          options.push({
            label: name,
            value: name
          })
          const usableData = summary[name]
          Object.assign(tData, explainOption(usableData, name))
        }
      } else {
        tData = explainOption(summary, cols)
      }
      const result: any = {
        subOptions,
        data: tData
      }
      if (options.length > 0) {
        result.options = options
      }
      return result
    }
    const createOneOptionsForHost = (split: any, cols: any) => {
      let tData: any = {}
      let subOptions: any = []
      cols.map((variable: string) => {
        subOptions.push({
          label: variable,
          value: variable
        })
        const list: any[] = []
        for (const key in split[variable]) {
          const cursor = parseInt(key)
          list.push({
            binning: (() => {
              if (isUndefined(split[variable][cursor + 1])) {
                return `${variable} > ${fixed(split[variable][cursor - 1])}`
              } else if (cursor === 1) {
                return `${variable} <= ${fixed(split[variable][cursor])}`
              } else {
                return `${fixed(split[variable][cursor - 1])} < ${variable} <= ${fixed(split[variable][cursor])}`
              }
            })(),
            anonym: `bin_${cursor - 1}`
          })
        }
        tData[variable] = list
      })
      return {
        subOptions,
        data: tData
      }
    }

    if (isGuest) {
      configuration['guest'] = createOneOptions(metrics_summary, split_pt_dict, 'guest')
      configuration['host'] = createOneOptions(host_metrics_summary, undefined, Object.keys(host_metrics_summary))
    }

    if (isHost) {
      configuration['host'] = createOneOptionsForHost(split_pt_dict, bin_col)
    }

    return {
      id: 'SplitTable',
      tag: FSplitTable,
      prop: {
        header: SplitMaskTableHeader,
        data: configuration,
        class: 'f-d-container',
        chart: isGuest
      }
    }
  }

  return {
    id: 'hetero_feature_binning',
    tag: 'section',
    prop: {
      class: 'f-d-container f-d-seperator'
    },
    children: [
      BinningCountTable(data),
      SplitTable(data)
    ]
  }
}
