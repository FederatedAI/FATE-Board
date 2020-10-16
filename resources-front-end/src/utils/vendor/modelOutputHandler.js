
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import store from '@/store/modules/app'
import { formatFloat } from '@/utils'
// import doubleBarOptions from '@/utils/chart-options/doubleBar'
import handleBinningData from '@/utils/vendor/binningDataHandler'
import handleSelectionData from '@/utils/vendor/selectionDataHandler'
import handleBoostData from '@/utils/vendor/boostDataHandler'
import handleCorrelationData from '@/utils/vendor/correlationDataHandler'

const { modelNameMap } = store.state

export default function({ outputType, responseData, role, partyId }) {
  let output = {
    isNoModelOutput: false
  }
  if (!responseData || Object.keys(responseData).length === 0) {
    output.isNoModelOutput = true
    return output
  }
  if (outputType === modelNameMap.boost || outputType === modelNameMap.homoBoost) {
    if (Object.keys(responseData).length > 0) {
      handleBoostData({ responseData, output, role, partyId, outputType })
    } else {
      output.isNoModelOutput = true
    }
    // dataio
  } else if (outputType === modelNameMap.dataIO) {
    const imputerData = []
    const outlierData = []
    const { imputerParam, outlierParam } = responseData
    const isExistImputerParams = imputerParam && imputerParam.missingReplaceValue && Object.keys(imputerParam.missingReplaceValue).length > 0
    const isExistOutlierParams = outlierParam && outlierParam.outlierReplaceValue && Object.keys(outlierParam.outlierReplaceValue).length > 0
    if (isExistImputerParams) {
      Object.keys(imputerParam.missingReplaceValue).forEach(key => {
        imputerData.push({
          variable: key,
          ratio: formatFloat(imputerParam.missingValueRatio[key]),
          value: formatFloat(imputerParam.missingReplaceValue[key])
        })
      })
      output.imputerData = imputerData
    }
    if (isExistOutlierParams) {
      Object.keys(outlierParam.outlierReplaceValue).forEach(key => {
        outlierData.push({
          variable: key,
          ratio: formatFloat(outlierParam.outlierValueRatio[key]),
          value: formatFloat(outlierParam.outlierReplaceValue[key])
        })
      })
      output.outlierData = outlierData
    }
    if (!isExistImputerParams && !isExistOutlierParams) {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.intersection) {
    if (responseData) {
      output = responseData
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.scale) {
    const data = responseData && responseData.colScaleParam
    const header = responseData && responseData.header
    const tBody = []
    if (data && header) {
      header.forEach(head => {
        const row = data[head]
        if (row) {
          row.variable = head
          row.columnLower = formatFloat(row.columnLower)
          row.columnUpper = formatFloat(row.columnUpper)
          tBody.push(row)
        }
      })
      output = {
        tBody
      }
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.homoLR ||
    outputType === modelNameMap.heteroLR ||
    outputType === modelNameMap.sklearnLR ||
    outputType === modelNameMap.heteroLinR ||
    outputType === modelNameMap.homoNN ||
    outputType === modelNameMap.poisson) {
    const { weight, intercept, isConverged, iters, needOneVsRest, oneVsRestResult } = responseData
    const tData = []
    if (oneVsRestResult) {
      const mod = oneVsRestResult.completedModels
      const classed = oneVsRestResult.oneVsRestClasses
      for (let i = 0; i < mod.length; i++) {
        const oWeight = mod[i].weight
        const header = mod[i].header
        const data = []
        for (const val of header) {
          data.push({
            variable: val,
            weight: formatFloat(oWeight[val])
          })
        }
        if (role.toLowerCase() !== 'host') {
          data.push({
            variable: 'intercept',
            weight: formatFloat(mod[i].intercept)
          })
        }
        const name = 'model_' + i + (role === 'guest' ? ':' + classed[i] : '')
        tData.push({
          name,
          data,
          isConverged: mod[i].isConverged,
          iters: mod[i].iters
        })
      }
      output = {
        tData
      }
    } else if (weight && Object.keys(weight).length > 0) {
      Object.keys(weight).forEach(key => {
        tData.push({
          variable: key,
          weight: formatFloat(weight[key])
        })
      })
      if (!needOneVsRest) {
        tData.push({
          variable: 'intercept',
          weight: formatFloat(intercept)
        })
      }
      if (needOneVsRest) {
        output = {
          tData
        }
      } else {
        output = {
          tData,
          isConverged,
          iters
        }
      }
      console.log(output)
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.selection) {
    const data = responseData && responseData.results
    if (data) {
      // const chartData = []
      // data.forEach(item => {
      //   const { filterName, featureValues, leftCols } = item
      //   const leftObj = leftCols.leftCols
      //   if (filterName && featureValues && Object.keys(featureValues).length > 0) {
      //     const options = deepClone(doubleBarOptions)
      //     options.title.text = filterName
      //     const sortArr = []
      //     Object.keys(featureValues).forEach(key => {
      //       sortArr.push({ key, value: featureValues[key], isLeft: leftObj[key] })
      //     })
      //     const sortKeyArr = []
      //     const sortValueArr = []
      //     sortArr.sort((a, b) => {
      //       return a.value - b.value
      //     })
      //     sortArr.forEach(item => {
      //       sortKeyArr.push(item.key)
      //       const valueObj = {
      //         value: item.value
      //       }
      //       if (!item.isLeft) {
      //         valueObj.itemStyle = { color: '#999' }
      //       }
      //       sortValueArr.push(valueObj)
      //     })
      //     options.yAxis.data = sortKeyArr
      //     const value = []
      //     sortValueArr.forEach(item => {
      //       value.push(item.value)
      //     })
      //     options.series[0].label.formatter = function(params) {
      //       return value[params.dataIndex]
      //     }
      //     let max = 0
      //     value.forEach((item, index, arr) => {
      //       if (item > max) {
      //         max = item
      //       }
      //       arr[index] = item
      //     })
      //     Object.keys(featureValues).forEach(() => {
      //       options.series[0].data.push(max * 1.2)
      //     })
      //     options.series[1].data = sortValueArr
      //     options.containerHeight = value.length * 20 + 150
      //     chartData.push(options)
      //     // console.log(sortArr)
      //   }
      // })
      // output.chartData = chartData

      // Hetero Feature Correlation测试

      // const featureCorrelationTableData = []
      // for (let i = 0; i < 50; i++) {
      //   featureCorrelationTableData.push({
      //     variable: 'variable' + (i + 1),
      //     vif: i + 1
      //   })
      // }
      // const correlationData = ['v10', 'v14', 'v7', 'class', 'v13', 'v6', 'v12', 'v1', 'v15']
      // const correlationDataReverse = deepClone(correlationData).reverse()
      // output = {
      //   featureCorrelationTableData,
      //   correlationData,
      //   correlationDataReverse
      // }
      output = Object.assign(handleSelectionData(responseData, partyId), output)
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.oneHot) {
    const data = responseData && responseData.colMap
    const options = []
    const variableData = {}
    if (data && Object.keys(data).length > 0) {
      Object.keys(data).forEach(key => {
        options.push({
          value: key,
          label: key
        })
        variableData[key] = []
        data[key].transformedHeaders.forEach((item, index) => {
          variableData[key].push({
            encoded_vector: item,
            value: data[key].values[index]
          })
        })
      })
      output = {
        options,
        variableData
      }
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.binning) {
    let data = responseData && responseData.binningResult
    let guestPartyId = 0
    let role = ''
    if (Array.isArray(data)) {
      guestPartyId = data[0].partyId
      role = data[0].role
      data = data[0].binningResult || {}
    } else {
      guestPartyId = data.partyId
      role = data.role
      data = data.binningResult
    }
    const hostData = responseData && responseData.hostResults

    if ((data && Object.keys(data).length > 0) || (hostData && hostData.length > 0)) {
      const middleData = handleBinningData(data, responseData.header, 'guest', guestPartyId, role, role)
      const sd = []
      const op = []
      for (const val of responseData.header) {
        for (const sdval of middleData.sourceData) {
          if (val === sdval.variable) {
            sd.push(sdval)
            break
          }
        }
        for (const opval of middleData.options) {
          if (val === opval.value) {
            op.push(opval)
            break
          }
        }
      }
      middleData.sourceData = sd
      middleData.options = op
      output.data = middleData
      const hostMiddle = []
      const hostPartyId = []
      for (const key in hostData) {
        hostMiddle.push(handleBinningData(hostData[key].binningResult, responseData.header, 'host', hostData[key].partyId, hostData[key].role, role))
        hostPartyId.push(hostData[key].partyId || key)
      }
      output.hostData = { data: hostMiddle, id: hostPartyId }
    } else {
      output.isNoModelOutput = true
    }
  } else if (outputType === modelNameMap.correlation) {
    output.correlation = handleCorrelationData(responseData, role)
    output.role = role
    output.partyId = partyId
  } else if (outputType === modelNameMap.psi) {
    const { featurePsi, totalScore } = responseData
    const psiSummaryTdata = []
    const psiFeatureTdata = {}
    const psiFeatureOption = []
    Object.keys(featurePsi).forEach(feature => {
      const featureName = featurePsi[feature].featureName
      const featureInterval = featurePsi[feature].interval
      psiFeatureTdata[featureName] = []
      psiSummaryTdata.push({
        variable: featureName,
        psi: totalScore[featureName]
      })
      psiFeatureOption.push({
        value: featureName,
        label: featureName
      })
      featureInterval.forEach((interval, index) => {
        psiFeatureTdata[featureName].push({
          binning: interval,
          expected: featurePsi[feature].expectPerc[index],
          actual: featurePsi[feature].actualPerc[index],
          psi: featurePsi[feature].psi[index]
        })
      })
    })
    output = { psiSummaryTdata, psiFeatureOption, psiFeatureTdata }
  }
  if (outputType === modelNameMap.heteroLR ||
    outputType === modelNameMap.heteroLinR ||
    outputType === modelNameMap.poisson ||
    outputType === modelNameMap.heteroNN ||
    outputType === modelNameMap.boost) {
    output.bestIteration = responseData.bestIteration
    if (Object.getOwnPropertyNames(output).length === 2) {
      if (output.bestIteration === -1) {
        output.isNoModelOutput = true
      }
    }
  }
  return output
}
