
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
// import { deepClone, filterLineArr } from '@/utils'
import { deepClone, formatFloat } from '@/utils'
import evaluationOptions from '@/utils/chart-options/evaluation-curve'
import stepwiseDataHandler from './stepwiseDataHandler'
// import { colorRgb } from '../tools/color'
import PSIbar from '../chart-options/PSIbar'

const { metricTypeMap } = store.state
const curveColor = [
  '#494ECE',
  '#00D269',
  '#FF8103',
  '#00DFCF',
  '#F23BA9',
  '#0080FF',
  '#C13CE1',
  '#FFCD03',
  '#7C56FF',
  '#A7CF02',
  '#00D3FF',
  '#FF1414'
]
const curveAlphaColor = [
  '#6E78FC',
  '#66E4A5',
  '#FFB367',
  '#6DF1E7',
  '#E576C2',
  '#66B3FF',
  '#DD83F2',
  '#FFEA84',
  '#B692F6',
  '#E1F397',
  '#77E3FF',
  '#FF5A5A'
]
const hideColor = '#999BA3'
// const curveColor = ['#f00', '#0f0', '#00f', '#0088ff']
const curveFormatter = (xName, yName, legendData, thresholdsArr = []) => {
  return (params) => {
    let str = ''
    params.forEach((obj, index) => {
      if (obj.seriesType !== 'line' || obj.color !== hideColor) {
        if (!legendData || legendData[index].isActive !== false) {
          let xValue = ''
          if (Array.isArray(thresholdsArr[obj.seriesIndex])) {
            xValue = thresholdsArr[obj.seriesIndex][obj.dataIndex]
          } else {
            xValue = thresholdsArr[obj.dataIndex]
          }
          if (xValue || xValue === 0) {
            str += `${xName}(${obj.seriesName}): ${xValue}<br>`
          }
          const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
          str += `${yName}(${obj.seriesName}): ${value}<br>`
        }
      }
    })
    return str
  }
}
export default function(
  {
    metricOutputList,
    evaluationOutputList,
    data,
    metric_type,
    modelOutputType,
    metric_namespace,
    metric_name,
    meta,
    unit_name,
    name,
    curve_name,
    pair_type,
    modelSummaryData,
    thresholds,
    role,
    party_id
  }) {
  let type = ''
  let outputData = ''
  const scaleMethod = meta.method
  curve_name = curve_name && curve_name.replace(/(train_|validate_)/g, '')
  pair_type = pair_type && pair_type.replace(/(train_|validate_)/g, '')
  curve_name = curve_name && curve_name.replace(/(train\.|validate\.)/g, 'fold_')
  thresholds = thresholds || []
  if (metric_type === metricTypeMap.dataIOText) {
    // type = 'text'
    // const arr = []
    // data.forEach(item => {
    //   if (item[0]) {
    //     arr.push(item[0])
    //   }
    // })
    // outputData = `${curve_name}: ${arr.join(', ')}`
  } else if (metric_type === metricTypeMap.sampleText) {
    type = 'text'
    outputData = `${data[0][0]}: ${data[0][1]}`
  } else if (metric_type === metricTypeMap.scale) {
    type = 'text'
    outputData = `method: ${meta.method || 'null'}`
  } else if (metric_type === metricTypeMap.sampleTable) {
    let finalData = null
    if (metricOutputList.length > 0) {
      for (let i = 0; i < metricOutputList.length; i++) {
        const val = metricOutputList[i]
        if (val.data.types && val.data.types === 'sampleNeedCombine') {
          finalData = metricOutputList.splice(i, 1)[0]
          break
        }
      }
    }
    type = 'table'
    const tHeader = [
      {
        prop: 'label',
        label: 'label'
      },
      {
        prop: 'original',
        label: 'original_count'
      },
      {
        prop: 'count',
        label: 'sample_count'
      }
    ]
    const tBody = finalData ? finalData.data.tBody : []
    for (const val of data) {
      let find = false
      for (const item of tBody) {
        if (item.label === val[0]) {
          find = true
          if (metric_namespace === 'original_count') {
            item.original = val[1]
          } else {
            item.count = val[1]
          }
          break
        }
      }
      if (!find) {
        tBody.push({
          label: val[0],
          count: metric_namespace === 'sample_count' ? val[1] : '-',
          original: metric_namespace === 'original_count' ? val[1] : '-'
        })
      }
    }
    const index = { label: 'layer' }
    outputData = {
      types: 'sampleNeedCombine',
      tHeader,
      tBody,
      index
    }
  } else if (metric_type === metricTypeMap.intersection) {
    type = 'text'
    data.forEach(item => {
      outputData += `${item[0]}: ${formatFloat(item[1])}` + '<br>'
    })
  } else if (metric_type === metricTypeMap.Accuracy ||
    metric_type === metricTypeMap.Gain ||
    metric_type === metricTypeMap.Lift ||
    metric_type === metricTypeMap.ROC ||
    metric_type === metricTypeMap.RecallMulti ||
    metric_type === metricTypeMap.PrecisionMulti ||
    metric_type === metricTypeMap.loss) {
    const typeArr = Object.keys(metricTypeMap)
    // for (let i = 0; i < data.length; i++) {
    //   if (data[i + 1] && data[i][0] === data[i + 1][0] && data[i][1] === data[i + 1][1]) {
    //     data.splice(i + 1, 1)
    //     i--
    //   }
    // }
    // thresholds = [...new Set(thresholds)]
    for (let i = 0; i < typeArr.length; i++) {
      if (metric_type === metricTypeMap[typeArr[i]]) {
        if (metric_type === metricTypeMap.RecallMulti ||
          metric_type === metricTypeMap.PrecisionMulti) {
          type = 'Precision Recall'
        } else if (metric_type === metricTypeMap.loss) {
          type = metricTypeMap.loss
        } else {
          type = typeArr[i]
        }
        break
      }
    }
    outputData = deepClone(evaluationOptions)
    if (metric_type === metricTypeMap.loss) {
      outputData.xAxis.minInterval = 1
    }
    outputData.xAxis.name = unit_name
    const seriesObj = {
      name: curve_name,
      type: 'line',
      smooth: false,
      // symbol: 'none',
      symbolSize: 1,
      itemStyle: {
        opacity: 1
      },
      lineStyle: {
        opacity: 1
      },
      data,
      pair_type
    }
    if (metric_type === metricTypeMap.Gain) {
      // outputData.xAxis.name = 'threshold'
      outputData.yAxis.name = 'gain'
      outputData.tooltip.formatter = curveFormatter('Threshold', 'Gain', null, thresholds)
    } else if (metric_type === metricTypeMap.Accuracy) {
      // outputData.xAxis.name = 'threshold'
      outputData.yAxis.name = 'accuracy'
      outputData.tooltip.formatter = curveFormatter('Threshold', 'Accuracy', null, thresholds)
    } else if (metric_type === metricTypeMap.Lift) {
      // outputData.xAxis.name = 'threshold'
      outputData.yAxis.name = 'lift'
      outputData.tooltip.formatter = curveFormatter('Threshold', 'Lift', null, thresholds)
    } else if (metric_type === metricTypeMap.ROC) {
      outputData.yAxis.name = 'tpr'
      seriesObj.areaStyle = {
        color: '#494ece',
        opacity: 0.1
      }

      outputData.tooltip.formatter = (params) => {
        let str = ''
        params.forEach(obj => {
          if (obj.seriesType !== 'line' || obj.color !== hideColor) {
            const xValue = thresholds[obj.dataIndex]
            if (xValue || xValue === 0) {
              str += `Threshold: ${xValue}<br>`
            }
            str += `Tpr(${obj.seriesName}): ${obj.data[1]}<br>`
            str += `Fpr(${obj.seriesName}): ${obj.axisValue}<br>`
          }
        })
        return str
      }
    } else if (metric_type === metricTypeMap.RecallMulti || metric_type === metricTypeMap.PrecisionMulti) {
      // console.log(curve_name,pair_type, metric_namespace)
      outputData.xAxis.name = 'class'
      outputData.xAxis.type = 'category'
      outputData.yAxis.name = 'precision, recall'
      outputData.tooltip.formatter = params => {
        let str = ''
        const xValue = params[0].axisValue
        str += `Class: ${xValue}<br>`
        params.forEach(obj => {
          if (obj.seriesType !== 'line' || obj.color !== hideColor) {
            const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
            str += `${obj.seriesName}: ${value}<br>`
          }
        })
        return str
      }
      const xArr = []
      const valueArr = []
      data.forEach(p => {
        xArr.push(p[0])
        valueArr.push(p[1])
      })
      outputData.xAxis.data = xArr
      seriesObj.data = valueArr
      seriesObj.name = curve_name
      // if (metric_type === metricTypeMap.RecallMulti) {
      //   seriesObj.name += '-recall'
      // } else {
      //   seriesObj.name += '-precision'
      // }
    } else if (metric_type === metricTypeMap.loss) {
      // outputData.xAxis.name = 'iteration'
      outputData.yAxis.name = 'loss'
      outputData.tooltip.formatter = (params) => {
        let str = ''
        const xValue = params[0].axisValue
        str += `iteration: ${xValue}<br>`
        params.forEach(obj => {
          if (obj.seriesType !== 'line' || obj.color !== hideColor) {
            const value = obj.data[1]
            str += `loss(${obj.seriesName}): ${formatFloat(value)}<br>`
          }
        })
        return str
      }
    }
    outputData.series.push(seriesObj)
    for (let i = 0; i < evaluationOutputList.length; i++) {
      const item = evaluationOutputList[i]
      if (item.type && item.type === type && item.nameSpace === metric_namespace) {
        if ((metric_type === metricTypeMap.RecallMulti || metric_type === metricTypeMap.PrecisionMulti)) {
          for (let j = 0; j < item.data.series.length; j++) {
            const curve = item.data.series[j]
            let color = ''
            const legendIndex = curve.legendIndex
            if (metric_type === metricTypeMap.PrecisionMulti) {
              color = curveColor[legendIndex] || hideColor
            } else {
              color = curveAlphaColor[legendIndex] || hideColor
            }
            const legendObj = { color, text: curve_name }
            if (curve.pair_type && curve.pair_type === pair_type) {
              if (metric_type === metricTypeMap.PrecisionMulti) {
                item.legendData[legendIndex].unshift(legendObj)
              } else {
                item.legendData[legendIndex].push(legendObj)
              }
              seriesObj.itemStyle.color = color
              item.data.series.push(seriesObj)
              return
            }
          }
        }
        const color = curveColor[item.data.series.length] || hideColor
        seriesObj.itemStyle.color = color
        if ((metric_type === metricTypeMap.RecallMulti || metric_type === metricTypeMap.PrecisionMulti)) {
          const legendIndex = item.legendData.length
          let color = ''
          if (metric_type === metricTypeMap.PrecisionMulti) {
            color = curveColor[legendIndex] || hideColor
          } else {
            color = curveAlphaColor[legendIndex] || hideColor
          }
          seriesObj.legendIndex = legendIndex
          item.data.series.push(seriesObj)
          const legendObj = { color, text: curve_name }
          item.legendData.push([legendObj])
        } else {
          item.thresholdsArr.push(thresholds)
          if (metric_type === metricTypeMap.Gain) {
            item.data.tooltip.formatter = curveFormatter('Threshold', 'Gain', item.legendData, item.thresholdsArr)
          } else if (metric_type === metricTypeMap.Accuracy) {
            item.data.tooltip.formatter = curveFormatter('Threshold', 'Accuracy', item.legendData, item.thresholdsArr)
          } else if (metric_type === metricTypeMap.Lift) {
            item.data.tooltip.formatter = curveFormatter('Threshold', 'Lift', item.legendData, item.thresholdsArr)
          } else if (metric_type === metricTypeMap.loss) {
            item.data.tooltip.formatter = outputData.tooltip.formatter = (params) => {
              let str = ''
              const xValue = params[0].axisValue
              str += `iteration: ${xValue}<br>`
              params.forEach((obj, index) => {
                if (obj.seriesType !== 'line' || obj.color !== hideColor) {
                  if (item.legendData[index].isActive !== false) {
                    const value = obj.data[1]
                    str += `loss(${obj.seriesName}): ${formatFloat(value)}<br>`
                  }
                }
              })
              return str
            }
          } else if (metric_type === metricTypeMap.RecallMulti || metric_type === metricTypeMap.PrecisionMulti) {
            item.data.tooltip.formatter = params => {
              let str = ''
              const xValue = params[0].axisValue
              str += `Class: ${xValue}<br>`
              params.forEach((obj, index) => {
                if (obj.seriesType !== 'line' || obj.color !== hideColor) {
                  if (item.legendData[index].isActive !== false) {
                    const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
                    str += `${obj.seriesName}: ${value}<br>`
                  }
                }
              })
              return str
            }
          } else if (metric_type === metricTypeMap.ROC) {
            item.data.tooltip.formatter = (params) => {
              let str = ''
              // console.log(params)
              // console.log(item.legendData)
              params.forEach((obj, index) => {
                if (obj.seriesType !== 'line' || obj.color !== hideColor) {
                  let items = null
                  for (const val of item.legendData) {
                    if (val.text === obj.seriesName) {
                      items = val
                      break
                    }
                  }
                  if (items && items.isActive !== false) {
                    const xValue = item.thresholdsArr[obj.seriesIndex][obj.dataIndex]
                    if (xValue || xValue === 0) {
                      str += `Threshold(${obj.seriesName}): ${xValue}<br>`
                    }
                    str += `Tpr(${obj.seriesName}): ${obj.data[1]}<br>`
                    str += `Fpr(${obj.seriesName}): ${obj.axisValue}<br>`
                  }
                }
              })
              return str
            }
          }

          item.data.series.push(seriesObj)
          item.legendData.push({
            color,
            text: curve_name
          })
        }
        return
      }
    }
    let color = ''
    const legendData = []
    if (metric_type === metricTypeMap.RecallMulti || metric_type === metricTypeMap.PrecisionMulti) {
      if (metric_type === metricTypeMap.PrecisionMulti) {
        color = curveColor[0] || hideColor
      } else {
        color = curveAlphaColor[0] || hideColor
      }
      outputData.series[0].itemStyle.color = color
      outputData.series[0].legendIndex = 0
      legendData.push([{
        color,
        text: curve_name
      }])
    } else {
      outputData.series[0].itemStyle.color = curveColor[0] || hideColor
      legendData.push({
        color: curveColor[0],
        text: curve_name
      })
    }

    const echartObj = {
      type,
      nameSpace: metric_namespace,
      data: outputData,
      legendData,
      thresholdsArr: [thresholds]
    }
    if (metric_namespace === 'train') {
      evaluationOutputList.unshift(echartObj)
    } else {
      evaluationOutputList.push(echartObj)
    }
    console.log(JSON.stringify(evaluationOutputList))
    // }
    return
  } else if (metric_type === metricTypeMap.RecallBinary || metric_type === metricTypeMap.PrecisionBinary) {
    let dataObj = {}
    if (Array.isArray(data)) {
      data.forEach(item => {
        dataObj[item[0]] = item[1]
      })
    } else {
      dataObj = data
    }
    // if (curve_name === 'train_fold_3') {
    //   console.log('data: ', data)
    // }
    const halfObj = {
      name: curve_name,
      type: 'line',
      smooth: false,
      // symbol: 'none',
      symbolSize: 1,
      halfData: dataObj,
      itemStyle: {
        opacity: 1
      },
      lineStyle: {
        opacity: 1
      },
      pair_type
    }

    outputData = deepClone(evaluationOptions)
    outputData.xAxis.name = 'recall'
    outputData.yAxis.name = 'precision'
    outputData.tooltip.formatter = (params) => {
      let str = ''
      // console.log(params)
      params.forEach(obj => {
        if (obj.seriesType !== 'line' || obj.color !== hideColor) {
          const thresholdValue = thresholds[obj.dataIndex]
          if (thresholdValue || thresholdValue === 0) {
            str += `Thresholds(${obj.seriesName}): ${thresholdValue}<br>`
          }
          const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
          str += `Precision(${obj.seriesName}):${value}<br>`
          str += `Recall(${obj.seriesName}):${obj.axisValue}<br>`
        }
      })
      return str
    }
    outputData.series.push(halfObj)
    // console.log('xxxxxxx', pair_type)
    for (let i = 0; i < evaluationOutputList.length; i++) {
      const item = evaluationOutputList[i]
      if (item.type === 'Precision Recall' && item.nameSpace === metric_namespace) {
        for (let j = 0; j < item.data.series.length; j++) {
          const curve = item.data.series[j]
          if (curve.pair_type === pair_type) {
            if (!item.thresholdsArr) {
              item.thresholdsArr = [thresholds]
            } else {
              item.thresholdsArr.push(thresholds)
            }
            // console.log(item.thresholdsArr)
            // if (metric_namespace === 'validate' && curve_name === 'fold_2') {
            //   console.log(thresholds)
            // }
            item.data.tooltip.formatter = (params) => {
              let str = ''
              // console.log(params),
              params.forEach((obj, index) => {
                if (obj.seriesType !== 'line' || obj.color !== hideColor) {
                  if (item.legendData[index].isActive !== false) {
                    const thresholdValue = item.thresholdsArr[index][obj.dataIndex]
                    if (thresholdValue || thresholdValue === 0) {
                      str += `Thresholds(${obj.seriesName}): ${thresholdValue}<br>`
                    }
                    const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
                    str += `Precision(${obj.seriesName}):${value}<br>`
                    str += `Recall(${obj.seriesName}):${obj.axisValue}<br>`
                  }
                }
              })
              return str
            }
            const prObj = {}
            Object.keys(curve.halfData).forEach(key => {
              const p = []
              if (metric_type === metricTypeMap.RecallBinary) {
                p[0] = dataObj[key]
                p[1] = curve.halfData[key]
              } else {
                p[0] = curve.halfData[key]
                p[1] = dataObj[key]
              }
              if (prObj[p[0]]) {
                if (p[1] > prObj[p[0]][1]) {
                  prObj[p[0]] = p
                }
              } else {
                prObj[p[0]] = p
              }
            })
            // console.log(item.data.series)
            // check color for echarts
            const color = curveColor[item.data.series.length - 1] || hideColor
            item.data.series[j].itemStyle.color = color
            item.legendData.push({
              color,
              text: curve_name
            })
            const sortFn = function(a, b) {
              return a[0] - b[0]
            }
            const curveData = Object.values(prObj)
            const curveDataSort = curveData.sort(sortFn)
            item.data.series[j].data = curveDataSort
            // if (curve_name === 'train_fold_3') {
            //   console.log('curveData: ', curveData)
            //   console.log('curveDataSort: ', curveDataSort)
            // }
            return
          }
        }
        item.data.series.push(halfObj)
        return
      }
    }
    const echartObj = {
      type: 'Precision Recall',
      metric_type,
      nameSpace: metric_namespace,
      data: outputData,
      legendData: []
    }
    if (metric_namespace === 'train') {
      evaluationOutputList.unshift(echartObj)
    } else {
      evaluationOutputList.push(echartObj)
    }
  } else if (metric_type === metricTypeMap['K-S']) {
    const seriesObj = {
      name: curve_name,
      type: 'line',
      smooth: false,
      symbolSize: 1,
      itemStyle: {
        opacity: 1
      },
      lineStyle: {
        opacity: 1
      },
      data,
      pair_type
    }
    type = 'K-S'
    outputData = deepClone(evaluationOptions)
    outputData.xAxis.name = unit_name
    outputData.yAxis.name = 'tpr, fpr'
    outputData.series.push(seriesObj)
    for (let i = 0; i < evaluationOutputList.length; i++) {
      const item = evaluationOutputList[i]
      if (item.type === type && item.nameSpace === metric_namespace) {
        // const curveArr = item.data.series.filter(c => {
        //   return c.pair_type
        // })
        for (let j = 0; j < item.data.series.length; j++) {
          const curve = item.data.series[j]
          if (curve.pair_type && curve.pair_type === pair_type) {
            let maxDValue = 0
            let maxDYValue1 = 0
            let maxDYValue2 = 0
            let maxDXValue = 0
            const legendIndex = curve.legendIndex
            curve.data.forEach((p, pIndex) => {
              const dValue = Math.abs(p[1] - data[pIndex][1])
              if (dValue > maxDValue) {
                maxDValue = dValue
                maxDXValue = p[0]
                maxDYValue1 = p[1]
                maxDYValue2 = data[pIndex][1]
              }
            })
            const formatterObj = /_tpr$/g.test(curve.name)
              ? {
                tpr: curve.name,
                fpr: seriesObj.name,
                pairType: curve.name.replace(/_tpr$/g, '')
              } : {
                tpr: seriesObj.name,
                fpr: curve.name,
                pairType: seriesObj.name.replace(/_tpr$/g, '')
              }
            formatterObj.thresholds = thresholds
            if (item.data.KSFormaterArr) {
              item.data.KSFormaterArr.push(formatterObj)
            } else {
              item.data.KSFormaterArr = [formatterObj]
            }
            item.data.series.push({
              name: '',
              type: 'line',
              symbol: 'none',
              data: [
                [maxDXValue, maxDYValue1],
                [maxDXValue, maxDYValue2]
              ],
              itemStyle: {
                color: curveColor[legendIndex]
              },
              lineStyle: {
                type: 'dashed',
                opacity: 1
              },
              pairType: pair_type
            })
            item.data.tooltip.formatter = params => {
              let str = ''
              // const xAxisName = trimId(params[0].axisId)
              // str += `${xAxisName}: ${params[0].axisValue}<br>`
              item.data.KSFormaterArr.forEach((ksObj, ksIndex) => {
                if (item.legendData[ksIndex].isActive !== false) {
                  // console.log(thresholds, params[0])
                  const listCheck = []
                  const thresholdValue = ksObj.thresholds[params[0].dataIndex]
                  if ((thresholdValue || thresholdValue === 0)) {
                    for (const val of params) {
                      if (val.seriesName.match(ksObj.pairType)) {
                        listCheck.push(val)
                      }
                    }
                    if (listCheck[0].color !== hideColor) {
                      str += `Threshold: (${ksObj.pairType})${thresholdValue}<br>`
                      let ksflag = false
                      let v1 = 0
                      let v2 = 0
                      listCheck.forEach(obj => {
                        if (obj.seriesType !== 'line' || obj.color !== hideColor) {
                          if (obj.seriesName === ksObj.tpr) {
                            // str += `Tpr(${ksObj.tpr}): ${obj.data[1]}<br>`
                            str += `${ksObj.tpr}: ${obj.data[1]}<br>`
                            v1 = obj.data[1]
                            ksflag = true
                          }
                          if (obj.seriesName === ksObj.fpr) {
                            // str += `Fpr(${ksObj.fpr}): ${obj.data[1]}<br>`
                            str += `${ksObj.fpr}: ${obj.data[1]}<br>`
                            v2 = obj.data[1]
                          }
                        }
                      })
                      if (ksflag) {
                        const ks = v1 - v2
                        str += `KS: ${formatFloat(ks)}<br>`
                      }
                    }
                  }
                }
              })
              return str
            }
            let color = ''
            if (/_tpr$/g.test(curve.name)) {
              color = curveAlphaColor[legendIndex] || hideColor
              seriesObj.itemStyle.color = color
              if (item.data.series.length > j + 1) {
                item.data.series.splice(j + 1, 0, seriesObj)
              } else {
                item.data.series.push(seriesObj)
              }
              item.legendData[legendIndex].push({ color, text: curve_name })
            } else {
              color = curveColor[legendIndex] || hideColor
              seriesObj.itemStyle.color = color
              item.data.series.splice(j, 0, seriesObj)
              item.legendData[legendIndex].unshift({ color: curveColor[legendIndex], text: curve_name })
            }
            return
          }
        }
        let color = ''
        const legendIndex = item.legendData.length
        seriesObj.legendIndex = legendIndex
        if (/_tpr$/g.test(curve_name)) {
          color = curveColor[legendIndex] || hideColor
        } else {
          color = curveAlphaColor[legendIndex] || hideColor
        }
        const arr = [{
          color,
          text: curve_name
        }]
        seriesObj.itemStyle.color = color
        item.data.series.push(seriesObj)
        item.legendData.push(arr)
        return
      }
    }
    let color = ''
    const legendData = []
    if (/_tpr$/g.test(curve_name)) {
      color = curveColor[0]
    } else {
      color = curveAlphaColor[0]
    }
    const arr = [{
      color,
      text: curve_name
    }]
    legendData.push(arr)
    outputData.series[0].itemStyle.color = color
    outputData.series[0].legendIndex = 0
    const echartObj = {
      type,
      nameSpace: metric_namespace,
      data: outputData,
      legendData
    }
    if (metric_namespace === 'train') {
      evaluationOutputList.unshift(echartObj)
    } else {
      evaluationOutputList.push(echartObj)
    }
    return
  } else if (metric_type === metricTypeMap.Summary) {
    // console.log('summary', metric_namespace, data)
    const dataObj = {}
    if (modelSummaryData.tHeader.length === 0) {
      modelSummaryData.tHeader.push({
        prop: 'metric_name',
        label: ''
      })
      modelSummaryData.tHeader.push({
        prop: 'metric_namespace',
        label: 'dataset'
      })
      data.forEach(row => {
        modelSummaryData.tHeader.push({
          prop: row[0],
          label: row[0]
        })
      })
    }
    dataObj.metric_name = metric_name.replace(/(train_|validate_)/g, '')
    dataObj.metric_namespace = metric_namespace
    data.forEach(row => {
      dataObj[row[0]] = row[1]
    })
    modelSummaryData.tBody.push(dataObj)
    modelSummaryData.tBody = modelSummaryData.tBody.sort((a, b) => {
      let r = 0
      const aName = a.metric_name.substr(0, a.metric_name.lastIndexOf('_'))
      const aIndex = a.metric_name.substr(a.metric_name.lastIndexOf('_') + 1)
      const bName = b.metric_name.substr(0, b.metric_name.lastIndexOf('_'))
      const bIndex = b.metric_name.substr(b.metric_name.lastIndexOf('_') + 1)
      if (aName === bName) {
        r = aIndex - bIndex
      } else {
        r = aName.charCodeAt(0) - bName.charCodeAt(0)
      }
      return r
    })
  } else if (metric_type === metricTypeMap.quantilePr) {
    type = 'quantile_pr'
    const tH = [{
      label: 'precision',
      prop: 'precision'
    }, {
      label: 'recall',
      prop: 'recall'
    }]
    const precision = []
    const recall = []
    const threshold = []
    meta.thresholds.forEach((item, index) => {
      threshold.push(item)
      precision.push(meta.p_scores[index][1])
      recall.push(meta.r_scores[index][1])
    })
    outputData = {
      theader: tH,
      precision,
      recall,
      threshold
    }
  } else if (metric_type === metricTypeMap.Union) {
    type = 'table'
    const tH = [{
      prop: 'name',
      label: 'Name'
    }, {
      prop: 'row',
      label: 'Row count'
    }]
    outputData = { tHeader: [], tBody: [] }
    if (outputData.tHeader.length === 0) {
      outputData.tHeader.push(...tH)
    }
    data.forEach(function(item, index) {
      const dataObj = {
        'name': item[0],
        'row': item[1]
      }
      if (item[0].toLowerCase() === 'total') {
        outputData.tBody.push(dataObj)
      } else {
        outputData.tBody.splice(outputData.tBody.length - 1, 0, dataObj)
      }
    })
  } else if (metric_type === metricTypeMap.Upload || metric_type === metricTypeMap.Download) {
    type = 'text'
    outputData = `${data[0][0]}: ${data[0][1]}`
  } else if (metric_type === metricTypeMap.Stepwise) {
    type = 'stepwise'
    let has = false
    // let index = 0
    let original = { steps: [], summary: { tables: [] }}
    for (let i = 0; i < metricOutputList.length; i++) {
      if (metricOutputList[i].type === type) {
        has = true
        original = metricOutputList[i].data
        // index = i
        break
      }
    }
    if (!has) {
      metricOutputList.push({
        type,
        nameSpace: metric_namespace,
        data: original,
        scaleMethod
      })
    }
    stepwiseDataHandler(original, data, meta, role, party_id)
  } else if (metric_type === metricTypeMap.F1Score || metric_type === metricTypeMap.ConfusionMat) {
    type = 'ConfusionMatrix'
    let obj = []
    for (let i = 0; i < metricOutputList.length; i++) {
      if (metricOutputList[i].type === type) {
        obj = metricOutputList.splice(i, 1)[0]
        break
      }
    }
    obj = obj.data || []
    obj = ConfusionMatExchange(obj, meta, metric_namespace, metric_name.replace(/(train_|validate_)/g, ''))
    outputData = obj
  } else if (metric_type === metricTypeMap.PSI) {
    type = 'PSI_summary'
    let obj = {}
    for (let i = 0; i < metricOutputList.length; i++) {
      if (metricOutputList[i].type === type) {
        obj = metricOutputList.splice(i, 1)[0]
        break
      }
    }
    obj = obj.data || {}
    obj = PSIExchange(obj, meta, metric_namespace, metric_name.replace(/(train_|validate_)/g, ''))
    outputData = obj
  }
  if (metric_type !== metricTypeMap.Stepwise) {
    metricOutputList.push({
      type,
      nameSpace: metric_namespace,
      data: outputData,
      scaleMethod
    })
  }
}

function ConfusionMatExchange(PSIinstance, meta, nameSpace, effect) {
  const metric_type = meta.metric_type
  effect = effect.replace('_f1_score', '')
  if (metric_type === metricTypeMap.F1Score) {
    PSIinstance = PSIinstance || []
    const mat = PSIinstance
    let effectList = null
    for (let i = 0; i < mat.length; i++) {
      if (mat[i].effect === effect) {
        effectList = mat[i]
        break
      }
    }
    if (!effectList) {
      effectList = effectList || { effect, nameSpace: {}}
      mat.push(effectList)
    }
    const space = effectList.nameSpace
    if (Object.keys(space).indexOf(nameSpace) < 0) {
      space[nameSpace] = {}
    }
    const matRow = space[nameSpace]
    matRow['f1score'] = matRow['f1score'] || {}
    const checklist = []
    const resultList = []
    meta.thresholds.forEach((item, pos) => {
      const index = checklist.indexOf(item)
      if (index < 0) {
        checklist.push(item)
        resultList.push(meta.f1_scores[pos])
      }
    })
    matRow['f1score'].thresholds = checklist
    matRow['f1score'].f1score = resultList
  }
  if (metric_type === metricTypeMap.ConfusionMat) {
    effect = effect.replace('_confusion_mat', '')
    PSIinstance = PSIinstance || []
    const mat = PSIinstance
    let effectList = null
    for (let i = 0; i < mat.length; i++) {
      if (mat[i].effect === effect) {
        effectList = mat[i]
        break
      }
    }
    if (!effectList) {
      effectList = effectList || { effect, nameSpace: {}}
      mat.push(effectList)
    }
    const space = effectList.nameSpace || {}
    if (Object.keys(space).indexOf(nameSpace) < 0) {
      space[nameSpace] = {}
    }
    const matRow = space[nameSpace]
    matRow['label'] = matRow['label'] || { thresholds: [], fn: [], fp: [], tn: [], tp: [] }
    meta.thresholds.forEach((item, index) => {
      if (matRow['label'].thresholds.indexOf(item) < 0) {
        matRow['label'].thresholds.push(item)
        matRow['label'].fn.push(meta.fn[index])
        matRow['label'].fp.push(meta.fp[index])
        matRow['label'].tn.push(meta.tn[index])
        matRow['label'].tp.push(meta.tp[index])
      }
    })
  }
  return PSIinstance
}

function PSIExchange(PSIinstance, meta, nameSpace, effect) {
  effect = effect.replace('_psi', '')
  PSIinstance[effect] = {}
  const result = PSIinstance[effect]
  result.totalPSI = meta.total_psi
  result.list = []
  for (let i = 0; i < meta.intervals.length; i++) {
    result.list.push({
      predict_score: meta.intervals[i],
      expected: meta.expected_percentage[i],
      expected_interval: meta.expected_interval[i],
      actual_interval: meta.actual_interval[i],
      actual: meta.actual_percentage[i],
      psi: meta.psi_scores[i],
      train_event: meta.train_pos_perc[i],
      val_event: meta.validate_pos_perc[i]
    })
  }
  result.summary = [{
    label: 'predict_score',
    prop: 'predict_score'
  }, {
    label: 'Expected %',
    prop: 'expected'
  }, {
    label: 'Actual %',
    prop: 'actual'
  }, {
    label: 'PSI',
    prop: 'psi'
  }]
  result.quantile = [{
    label: 'predict_score',
    prop: 'predict_score'
  }, {
    label: 'train',
    child: [{
      label: 'instance_count(%total)',
      prop: 'expected_interval'
    }, {
      label: 'event_ratio',
      prop: 'train_event'
    }]
  }, {
    label: 'validation',
    child: [{
      label: 'instance_count(%total)',
      prop: 'actual_interval'
    }, {
      label: 'event_ratio',
      prop: 'val_event'
    }]
  }]
  // TODO 两张图表内容
  const pic = JSON.parse(JSON.stringify(PSIbar))
  pic.series.push({
    name: 'Expected',
    type: 'bar',
    data: meta.expected_percentage,
    itemStyle: {
      color: '#5E7FEB'
    },
    barMaxWidth: 15
  })
  pic.series.push({
    name: 'Actual',
    type: 'bar',
    data: meta.actual_percentage,
    itemStyle: {
      color: '#0Ec7a5'
    },
    barMaxWidth: 15
  })
  pic.series.push({
    name: 'PSI',
    type: 'line',
    yAxisIndex: 1,
    data: meta.psi_scores,
    itemStyle: {
      color: '#FF9E1F'
    }
  })
  pic.legend.data = ['Expected', 'Actual', 'PSI']
  pic.xAxis.data = meta.intervals
  pic.yAxis[0].name = 'Expected, Actual'
  const biggestY0 = getBiggest([...meta.expected_percentage, ...meta.actual_percentage])
  pic.yAxis[0].max = biggestY0
  pic.yAxis[0].interval = biggestY0 / 5
  pic.yAxis[0].axisLabel.formatter = (value) => { return `${accMul(value, 100, biggestY0)} %` }
  pic.yAxis[1].name = 'PSI'
  const biggestY1 = getBiggest(meta.psi_scores)
  pic.yAxis[1].max = biggestY1
  pic.yAxis[1].interval = biggestY1 / 5
  pic.yAxis[1].axisLabel.formatter = (value) => { return `${accMul(value, 1, biggestY1)}` }
  pic.tooltip.formatter = (param) => {
    let str = param[0].name + '<br/>'
    param.forEach((item) => {
      str += `${item.seriesName}: ${item.seriesName !== 'PSI' ? (item.data * 100).toFixed(4) + '%' : item.data}<br/>`
    })
    return str
  }
  result.summaryPic = pic

  const quantilePic = JSON.parse(JSON.stringify(PSIbar))
  quantilePic.series.push({
    name: 'train_%total',
    type: 'bar',
    data: meta.expected_percentage,
    itemStyle: {
      color: '#5E7FEB'
    },
    barMaxWidth: 15
  })
  quantilePic.series.push({
    name: 'val_%total',
    type: 'bar',
    data: meta.actual_percentage,
    itemStyle: {
      color: '#0Ec7a5'
    },
    barMaxWidth: 15
  })
  quantilePic.series.push({
    name: 'train_event_ratio',
    type: 'line',
    yAxisIndex: 1,
    data: meta.train_pos_perc,
    itemStyle: {
      color: '#FF9E1F'
    }
  })
  quantilePic.series.push({
    name: 'val_event_ratio',
    type: 'line',
    yAxisIndex: 1,
    data: meta.validate_pos_perc,
    itemStyle: {
      color: '#FF4F38'
    }
  })
  quantilePic.legend.data = ['train_%total', 'val_%total', 'train_event_ratio', 'val_event_ratio']
  quantilePic.xAxis.data = meta.intervals
  quantilePic.yAxis[0].name = '%total'
  const biggest2Y0 = getBiggest([...meta.expected_percentage, ...meta.actual_percentage])
  quantilePic.yAxis[0].max = biggest2Y0
  quantilePic.yAxis[0].interval = accDivCoupon(biggest2Y0, 5)
  quantilePic.yAxis[0].axisLabel.formatter = (value) => { return `${accMul(value, 100, biggest2Y0)} %` }
  quantilePic.yAxis[1].name = 'event_ratio'
  const biggest2Y1 = getBiggest([...meta.train_pos_perc, ...meta.validate_pos_perc])
  quantilePic.yAxis[1].max = biggest2Y1
  quantilePic.yAxis[1].interval = accDivCoupon(biggest2Y1, 5)
  quantilePic.yAxis[1].axisLabel.formatter = (value) => {
    return `${accMul(value, 100, biggest2Y1)} %`
  }
  quantilePic.tooltip.formatter = (param) => {
    let str = param[0].name + '<br/>'
    param.forEach((item) => {
      str += `${item.seriesName}: ${(item.data * 100).toFixed(4) + '%'}<br/>`
    })
    return str
  }
  result.quantilePic = quantilePic
  return PSIinstance
}

function getBiggest(vals) {
  let biggest = 0
  for (const val of vals) {
    if (val > biggest) {
      biggest = val
    }
  }
  const fx = biggest.toString().split('.')
  let FixedTo = fx.length > 1 ? (fx[1].match(/^0+/) ? fx[1].match(/^0+/)[0].length : 0) : 0
  if (FixedTo) {
    FixedTo += 2
  } else {
    FixedTo = 2
  }
  let midd = parseFloat(biggest.toFixed(FixedTo))
  while (midd < biggest) {
    midd = parseFloat((midd + accDivCoupon(1, Math.pow(10, FixedTo))).toFixed(FixedTo))
  }
  biggest = parseFloat(((Math.ceil((midd * Math.pow(10, FixedTo)) / 5) * 5) / Math.pow(10, FixedTo)).toFixed(FixedTo))
  if (biggest === 0) {
    biggest = 0.1
  }
  return biggest
}

function accDivCoupon(arg1, arg2) {
  try {
    let t1 = arg1.toString().split('.')
    t1 = t1.length > 1 ? t1[1].length : 0
    let t2 = arg2.toString().split('.')
    t2 = t2.length > 1 ? t2[1].length : 0
    const r1 = Number(arg1.toString().replace('.', ''))
    const r2 = Number(arg2.toString().replace('.', ''))
    return (r1 / r2) * Math.pow(10, t2 - t1)
  } catch (e) {
    // console.log()
  }
}

function accMul(arg1, arg2, lens) {
  try {
    let m = 0
    let len = lens.toString().split('.').length > 1 ? lens.toString().split('.')[1].length : 0
    if (len < 2) len = 2
    const s1 = arg1.toFixed(len)
    const s2 = arg2.toFixed(len)
    m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0
    m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0
    let result = Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
    const reslist = result.toString().split('.')
    if (result.toString().split('.').length > 1) {
      if (!reslist[1].match(/([0-9])/)) {
        result = parseInt(result)
      }
    }
    return result
  } catch (e) {
    // TODO: console
  }
}
