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

const encodeNodeQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
    query += applyIfKeyIn(['nid'], key, value, inBrackets)
  })

  return prepareQueryString(query)
}

const encodeSegmentQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid', 'nid', 'pid', 'sgi'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
  })

  return prepareQueryString(query)
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
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid', 'pid', 'poi'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
  })

  return prepareQueryString(query)
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
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid', 'nid', 'mt', 'sc', 'max'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
  })

  return prepareEncodeQuery(query)
}
const encodeMeasurementCsvQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid', 'nid', 'mt'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
  })

  return prepareEncodeQuery(query)
}
const encodeCorrelationQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += addQuotesAndColon(key)
    query += applyIfKeyIn(['sid', 'cid', 'sgi', 'max', 'nd'], key, value, addComma)
    query += applyIfKeyIn(['apikey'], key, value, inQuotes)
  })

  return prepareEncodeQuery(query)
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
