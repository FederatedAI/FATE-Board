import { FPearson } from '@/components/Pearson'
import fixed from '../tools/fixed'
import getModelData from "../tools/getModelData"
import sort from '../tools/sort'

export default function feature_correlation (
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const mData= getModelData(modelData)
  const { data, meta } = mData.output_model

  const { local_corr, remote_corr, vif } = data
  const { column_anonymous_map } = meta

  const isHost = role.match(/host/i)

  const  theader = <any>[{
    label: 'variable',
    prop: 'variable',
    width: 90,
  }]
  let tdata = []

  const hasAnony = Object.keys(column_anonymous_map || {}).length > 0
  if (hasAnony) {
    theader.push({
      label: 'anonym',
      prop: 'anonym',
      width: 130,
    })
  }

  const hasVif = Object.keys(vif.vif || vif).length > 0
  if (hasVif) {
    theader.push({
      label: 'vif',
      prop: 'vif',
      width: 120,
      sortable: true
    })
  }

  let local_key = Object.keys(local_corr)
  if (local_key && local_key.length > 0) {
    local_key = sort(local_key)
    for (const each of local_key) {
      const row = <any>{
        variable: each,
      }
      if (hasAnony) {
        row.anonym = column_anonymous_map[each]
      }
      if (hasVif) {
        row.vif = fixed((vif.vif || vif)[each])
      }
      tdata.push(row)
    }
  }

  let remote_key = Object.keys(remote_corr || {})
  if (remote_key && remote_key.length > 0) {
    if (!isHost) {
      remote_key = sort(remote_key)
    } else {
      remote_key = sort(Object.keys(remote_corr[remote_key[0]]))
    }
  }

  const correlation = {
    id: 'FeatureCorrelation',
    tag: 'section',
    prop: {
      class: 'f-d-container'
    },
    children: [{
      id: 'FeatureCorrelationDisplay',
      tag: FPearson,
      prop: {
        header: theader,
        data: tdata,
        localCorr: local_key,
        remoteCorr: remote_key,
        localData: local_corr,
        remoteData: remote_corr
      }
    }]
  }

  return correlation
}
