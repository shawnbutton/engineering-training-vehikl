const removeTrailingComma = queryString => queryString.substring(0, queryString.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const appendWithComma = (queryString, value) => queryString + addComma(value)

const appendWithQuotes = (queryString, value) => queryString + inQuotes(value)

const appendInBrackets = (queryString, nIdValue) => queryString + inBrackets(nIdValue)

const appendWithColon = (queryString, param) => queryString + `"${param}":`

const addBraces = query => encodeURIComponent('{') + query + encodeURIComponent('}')

const encodeTopLeakSitesString = data => {
  const ret = []
  for (const d in data) { ret.push(encodeURIComponent(d) + '=' + encodeURI(data[d])) }
  return ret.join('&')
}

const encodeNodeQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(key => {
    queryString += `"${key}":`

    const value = params[key]
    if (key === 'sid') {
      queryString = appendWithComma(queryString, value)
    } else if (key === 'apikey') {
      queryString = appendWithQuotes(queryString, value)
    } else if (key === 'nid') {
      queryString = appendInBrackets(queryString, value)
    }
  })

  const withoutComma = removeTrailingComma(queryString)
  return addBraces(withoutComma)
}

const encodePipeQueryString = params =>
  addBraces(encode(params, isNaN))

const encodeSegmentQueryString = object =>
  addBraces(encode(object, ['sid', 'nid', 'pid', 'sqi']))

const encodeMeasurementQueryString = params =>
  addBraces(encodeURIComponent(encode(params, ['sid', 'nid', 'mt', 'sc', 'max'])))

const encodeMeasurementCsvQueryString = params =>
  addBraces(encodeURIComponent(encode(params, ['sid', 'nid', 'mt'])))

const encodeCorrelationQueryString = params =>
  addBraces(encodeURIComponent(encode(params, ['sid', 'sgi', 'max', 'nd'])))

const encodePipeRepairQueryString = params =>
  addBraces(encode(params, ['sid', 'pid', 'poi']))

const encodeSpectrumRepairQueryString = object => {
  return addBraces(encode(object))
}

const encodePoiQueryString = object => {
  return addBraces(encode(object))
}

const encode = (object, values) => {
  const parts = []

  Object
    .keys(object)
    .forEach(function (key) { parts.push(encodePart(key, object[key], values)) })

  return removeTrailingComma(parts.join(''))
}

const encodePart = (key, value, values) => {
  if (key === 'apikey') {
    return `"${key}":"${value}",`
  } else if ((typeof values === 'function') && values(value)) {
    return `"${key}":"${value}",`
  } else if ((typeof values === 'function')) {
    return `"${key}":${value},`
  } else if (values === undefined) {
    return `"${key}":${value},`
  } else if (values.includes(key)) {
    return `"${key}":${value},`
  } else {
    return `"${key}":`
  }
}

module.exports = {
  encodeTopLeakSitesString,
  encodeNodeQueryString,
  encodeSegmentQueryString,
  encodePipeQueryString,
  encodePipeRepairQueryString,
  encodeSpectrumRepairQueryString,
  encodePoiQueryString,
  encodeMeasurementQueryString,
  encodeMeasurementCsvQueryString,
  encodeCorrelationQueryString
}
