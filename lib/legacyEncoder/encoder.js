const ENCODED_LEFT_BRACE = encodeURIComponent('{')
const ENCODED_RIGHT_BRACE = encodeURIComponent('}')

const removeTrailingComma = query => query.substring(0, query.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const addBraces = query => ENCODED_LEFT_BRACE + query + ENCODED_RIGHT_BRACE

const appendWithColon = (query, param) => query + `"${param}":`

function prepareEncodeQuery (query) {
  return addBraces(encodeURIComponent(removeTrailingComma(query)))
}

const prepareQueryString = (query) => {
  return addBraces(removeTrailingComma(query))
}
const encodeTopLeakSitesString = data => Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURI(data[key])}`).join('&')

const encodeNodeQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += `"${key}":`
    query += thatThingDooWoop(['sid'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
    query += thatThingDooWoop(['nid'], key, value, inBrackets)
  })

  return prepareQueryString(query)
}

const conditionallyApply = (condition, value, fn, def = '') => condition ? fn(value) : def
const thatThingDooWoop = (arr, key, value, fn) => conditionallyApply(arr.includes(key), value, fn)

const encodeSegmentQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query = appendWithColon(query, key)

    const value = params[key]
    query += thatThingDooWoop(['sid', 'nid', 'pid', 'sgi'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
  })

  return prepareQueryString(query)
}
const encodePipeQueryString = params => {
  let query = ''

  for (const key in params) {
    query += '"' + key + '":'
    const value = params[key]

    query += conditionallyApply(isNaN(value), value, inQuotes, addComma(value))
  }

  return prepareQueryString(query)
}
const encodePipeRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    const value = params[key]
    query += '"' + key + '":'
    query += thatThingDooWoop(['sid', 'pid', 'poi'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
  })

  return prepareQueryString(query)
}
const encodeSpectrumRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
    if (key !== 'apikey') {
      query += addComma(value)
    }
  })

  return prepareQueryString(query)
}

const encodeMeasurementQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]
    query += thatThingDooWoop(['sid', 'nid', 'mt', 'sc', 'max'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
  })

  return prepareEncodeQuery(query)
}
const encodeMeasurementCsvQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    query += thatThingDooWoop(['sid', 'nid', 'mt'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
  })

  return prepareEncodeQuery(query)
}
const encodeCorrelationQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    query += thatThingDooWoop(['sid', 'cid', 'sgi', 'max', 'nd'], key, value, addComma)
    query += thatThingDooWoop(['apikey'], key, value, inQuotes)
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
