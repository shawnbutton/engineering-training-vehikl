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

  Object.keys(params).forEach(param => {
    query = appendWithColon(query, param)

    const value = params[param]
    if (param === 'sid' || param === 'nid' || param === 'pid' || param === 'sgi') {
      query = appendWithComma(query, value)
    } else if (param === 'apikey') {
      query = appendWithQuotes(query, value)
    }
  })

  return prepareQueryString(query, false);
}
const encodePipeQueryString = params => {
  let query = ''

  // for each parameter enclose in quotes if key or string
  for (const param in params) {
    query += '"' + param + '":'
    if (isNaN(params[param])) {
      query += inQuotes(params[param])
    } else {
      query += addComma(params[param])
    }
  }

  return prepareQueryString(query, false)
}
const encodePipeRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(function (param) {
    query += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'pid':
      case 'poi':
        query += addComma(params[param])
        break

      case 'apikey':
        query += inQuotes(params[param])
        break
    }
  })

  return prepareQueryString(query, false)
}
const encodeSpectrumRepairQueryString = params => {
  let query = ''

  Object.keys(params).forEach(function (param) {
    query += '"' + param + '":'

    switch (param) {
      case 'apikey':
        query += inQuotes(params[param])
        break

      default:
        query += addComma(params[param])
        break
    }
  })

  return prepareQueryString(query, false)
}

const encodeMeasurementQueryString = params => {
  let query = ''

  Object.keys(params).forEach(function (param) {
    query += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'nid':
      case 'mt':
      case 'sc':
      case 'max':
        query += addComma(params[param])
        break

      case 'apikey':
        query += inQuotes(params[param])
        break
    }
  })

  return prepareQueryString(query)
}
const encodeMeasurementCsvQueryString = params => {
  let query = ''

  Object.keys(params).forEach(function (parameterName) {
    query += '"' + parameterName + '":'

    switch (parameterName) {
      case 'sid':
      case 'nid':
      case 'mt':
        query += addComma(params[parameterName])
        break

      case 'apikey':
        query += inQuotes(params[parameterName])
        break
    }
  })

  return prepareQueryString(query)
}
const encodeCorrelationQueryString = params => {
  let query = ''

  Object.keys(params).forEach(function (param) {
    query += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'cid':
      case 'sgi':
      case 'max':
      case 'nd':
        query += addComma(params[param])
        break

      case 'apikey':
        query += inQuotes(params[param])
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
