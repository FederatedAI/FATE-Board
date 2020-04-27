export default function(data, role) {
  const final = { corr: {}, localHeader: [], otherHeader: [], anony: [], anonyHeader: [] }
  if (role === 'guest') {
    final.localHeader = data.allNames[0].names
    final.otherHeader = data.allNames[1].names
  } else {
    final.localHeader = data.allNames[1].names
    final.otherHeader = data.allNames[0].names
  }
  // }
  final.anonyHeader = [
    {
      label: 'variable',
      prop: 'name',
      width: 100
    },
    {
      label: 'anonym in ' + (role === 'guest' ? 'host' : 'guest'),
      prop: 'anonymous',
      width: 150
    }
  ]
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
  if (role === 'host') {
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
