
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

export default function(data, role) {
  const single = !(data.allNames.length > 1)
  const final = { corr: {}, localHeader: [], otherHeader: [], anony: [], anonyHeader: [], single }
  if (role === 'guest') {
    final.localHeader = data.allNames.length > 1 ? data.allNames[0].names : data.allNames[0].names
    final.otherHeader = data.allNames.length > 1 ? data.allNames[1].names : []
  } else {
    final.localHeader = data.allNames.length > 1 ? data.allNames[1].names : data.allNames[0].names
    final.otherHeader = data.allNames.length > 1 ? data.allNames[0].names : []
  }
  // }
  final.anonyHeader = [
    {
      label: 'variable',
      prop: 'name',
      width: 100
    }
  ]
  if (!single) {
    final.anonyHeader.push({
      label: 'anonym in ' + (role === 'guest' ? 'host' : 'guest'),
      prop: 'anonymous',
      width: 150
    })
  }
  final.anony = data.anonymousMap
  // get local correlation
  for (let i = 0; i < final.localHeader.length; i++) {
    for (let j = 0; j < final.localHeader.length; j++) {
      if (!final.corr[final.localHeader[i]]) {
        final.corr[final.localHeader[i]] = {}
      }
      final.corr[final.localHeader[i]][final.localHeader[j]] = data.localCorr[i * final.localHeader.length + j]
    }
  }
  // get other Correlation
  if (final.otherHeader.length > 0) {
    for (let i = 0; i < final.localHeader.length; i++) {
      for (let j = 0; j < final.otherHeader.length; j++) {
        if (!final.corr[final.localHeader[i]]) {
          final.corr[final.localHeader[i]] = {}
        }
        final.corr[final.localHeader[i]][final.otherHeader[j]] = data.corr[i * final.otherHeader.length + j]
      }
    }
  }
  if (!single) {
    for (let i = 0; i < final.localHeader.length; i++) {
      for (const val of final.anony) {
        if (val.name === final.localHeader[i]) {
          final.localHeader[i] += '(' + val.anonymous + ')'
          break
        }
      }
    }
  }
  return final
}
