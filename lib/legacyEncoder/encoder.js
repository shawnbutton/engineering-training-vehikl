const ENCODED_LEFT_BRACE = encodeURIComponent('{')
const ENCODED_RIGHT_BRACE = encodeURIComponent('}')

const removeTrailingComma = query => query.substring(0, query.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const appendWithComma = (query, value) => query + addComma(value)

const appendWithQuotes = (query, value) => query + inQuotes(value)

const appendInBrackets = (query, nIdValue) => query + inBrackets(nIdValue)

const addBraces = query => ENCODED_LEFT_BRACE + query + ENCODED_RIGHT_BRACE

const appendWithColon = (query, param) => query + `"${param}":`

// const x = (object, )

const prepareQueryString = (query, shouldEncode = true) => {
  return shouldEncode
    ? addBraces(encodeURIComponent(removeTrailingComma(query)))
    : addBraces(removeTrailingComma(query))
}

const encodeTopLeakSitesString = data => {
  //TODO: refactor to map
  const ret = []
  for (const d in data) { ret.push(encodeURIComponent(d) + '=' + encodeURI(data[d])) }
  return ret.join('&')
}

const encodeNodeQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += `"${key}":`

    const value = params[key]
    if (key === 'sid') {
      query = appendWithComma(query, value)
    } else if (key === 'apikey') {
      query = appendWithQuotes(query, value)
    } else if (key === 'nid') {
      query = appendInBrackets(query, value)
    }
  })

  return prepareQueryString(query, false)
}

const encodeSegmentQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query = appendWithColon(query, key)

    const value = params[key]
    if (key === 'sid' || key === 'nid' || key === 'pid' || key === 'sgi') {
      query = appendWithComma(query, value)
    } else if (key === 'apikey') {
      query = appendWithQuotes(query, value)
    }
  })

  return prepareQueryString(query, false)
}
const encodePipeQueryString = params => {
  let query = ''

  for (const key in params) {
    query += '"' + key + '":'
    const value = params[key]
    if (isNaN(value)) {
      query += inQuotes(value)
    } else {
      query += addComma(value)
    }
  }

  return prepareQueryString(query, false)
}
const encodePipeRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    switch (key) {
      case 'sid':
      case 'pid':
      case 'poi':
        query += addComma(value)
        break

      case 'apikey':
        query += inQuotes(value)
        break
    }
  })

  return prepareQueryString(query, false)
}
const encodeSpectrumRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    switch (key) {
      case 'apikey':
        query += inQuotes(value)
        break

      default:
        query += addComma(value)
        break
    }
  })

  return prepareQueryString(query, false)
}

const encodeMeasurementQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    switch (key) {
      case 'sid':
      case 'nid':
      case 'mt':
      case 'sc':
      case 'max':
        query += addComma(value)
        break

      case 'apikey':
        query += inQuotes(value)
        break
    }
  })

  return prepareQueryString(query)
}
const encodeMeasurementCsvQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    switch (key) {
      case 'sid':
      case 'nid':
      case 'mt':
        query += addComma(value)
        break

      case 'apikey':
        query += inQuotes(value)
        break
    }
  })

  return prepareQueryString(query)
}
const encodeCorrelationQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query += '"' + key + '":'

    const value = params[key]

    switch (key) {
      case 'sid':
      case 'cid':
      case 'sgi':
      case 'max':
      case 'nd':
        query += addComma(value)
        break

      case 'apikey':
        query += inQuotes(value)
        break
    }
  })

  return prepareQueryString(query)
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
