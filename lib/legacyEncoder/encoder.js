const ENCODED_LEFT_BRACE = encodeURIComponent('{')
const ENCODED_RIGHT_BRACE = encodeURIComponent('}')

const removeTrailingComma = query => query.substring(0, query.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const addBraces = query => ENCODED_LEFT_BRACE + query + ENCODED_RIGHT_BRACE

const addQuotesAndColon = param => `"${param}":`

const prepareEncodeQuery = query => addBraces(encodeURIComponent(removeTrailingComma(query)))

const prepareQueryString = query => addBraces(removeTrailingComma(query))

const conditionallyApply = (condition, value, whenTrue, whenFalse) => condition ? whenTrue(value) : whenFalse(value)

const applyIfKeyIn = (arr, key, value, fn) => conditionallyApply(arr.includes(key), value, fn, () => '')

const encodeTopLeakSitesString = data => Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURI(data[key])}`).join('&')

const encodeQuery = (params, map) => {
  let query = ''
  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    if (map[key]) {
      query += map[key](value)
    }
  })

  return query
}

const prepareEncodedString = (params, map) => prepareQueryString(encodeQuery(params, map))

const encodeNodeQueryString = params => {
  const map = {
    sid: addComma,
    apikey: inQuotes,
    nid: inBrackets
  }

  return prepareEncodedString(params, map)
}

const encodeSegmentQueryString = params => {
  const map = {
    sid: addComma,
    nid: addComma,
    pid: addComma,
    sgi: addComma,
    apikey: inQuotes
  }

  return prepareEncodedString(params, map)
}

const encodePipeQueryString = params => {
  let query = ''

  for (const key in params) {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += conditionallyApply(isNaN(value), value, inQuotes, addComma)
  }

  return prepareQueryString(query)
}

const encodePipeRepairQueryString = params => {
  const map = {
    sid: addComma,
    pid: addComma,
    poi: addComma,
    apikey: inQuotes
  }

  return prepareEncodedString(params, map)
}

const encodeSpectrumRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
    if (key !== 'apikey') {
      query += addComma(value)
    }
  })

  return prepareQueryString(query)
}

const encodeMeasurementQueryString = params => {
  const map = {
    sid: addComma,
    nid: addComma,
    mt: addComma,
    sc: addComma,
    max: addComma,
    apikey: inQuotes
  }

  return prepareEncodeQuery(encodeQuery(params, map))
}

const encodeMeasurementCsvQueryString = params => {
  const map = {
    sid: addComma,
    nid: addComma,
    mt: addComma,
    apikey: inQuotes
  }

  return prepareEncodeQuery(encodeQuery(params, map))
}

const encodeCorrelationQueryString = params => {
  const map = {
    sid: addComma,
    cid: addComma,
    sgi: addComma,
    max: addComma,
    nd: addComma,
    apikey: inQuotes
  }

  return prepareEncodeQuery(encodeQuery(params, map))
}

const encodePoiQueryString = encodeSpectrumRepairQueryString

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
