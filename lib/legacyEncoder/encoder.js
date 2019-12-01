const ENCODED_LEFT_BRACE = encodeURIComponent('{')
const ENCODED_RIGHT_BRACE = encodeURIComponent('}')

const removeTrailingComma = queryString => queryString.substring(0, queryString.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const appendWithComma = (queryString, value) => queryString + addComma(value)

const appendWithQuotes = (queryString, value) => queryString + inQuotes(value)

const appendInBrackets = (queryString, nIdValue) => queryString + inBrackets(nIdValue)

const addBraces = queryString => ENCODED_LEFT_BRACE + queryString + ENCODED_RIGHT_BRACE

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

const appendWithColon = (queryString, param) => queryString + `"${param}":`

const encodeSegmentQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString = appendWithColon(queryString, param)

    if (param === 'sid' || param === 'nid' || param === 'pid' || param === 'sgi') {
      queryString = appendWithComma(queryString, params[param])
    } else if (param === 'apikey') {
      queryString = appendWithQuotes(queryString, params[param])
    }
  })

  queryString = removeTrailingComma(queryString)

  return addBraces(queryString)
}
const encodePipeQueryString = params => {
  let queryString = ''

  // for each parameter enclose in quotes if key or string
  for (const param in params) {
    queryString += '\"' + param + '\":'
    if (isNaN(params[param])) {
      queryString += '\"' + params[param] + '\",'
    } else {
      queryString += params[param] + ','
    }
  }queryString = removeTrailingComma(queryString)

  return addBraces(queryString)
}
const encodePipeRepairQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'sid':
      case 'pid':
      case 'poi':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    queryString +
    encodeURIComponent('}')
  return queryString
}
const encodeSpectrumRepairQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break

      default:
        queryString += params[param] + ','
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    queryString +
    encodeURIComponent('}')
  return queryString
}
const encodePoiQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break

      default:
        queryString += params[param] + ','
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    queryString +
    encodeURIComponent('}')
  return queryString
}
const encodeMeasurementQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'sid':
      case 'nid':
      case 'mt':
      case 'sc':
      case 'max':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    encodeURIComponent(queryString) +
    encodeURIComponent('}')
  return queryString
}
const encodeMeasurementCsvQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'sid':
      case 'nid':
      case 'mt':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    encodeURIComponent(queryString) +
    encodeURIComponent('}')
  return queryString
}
const encodeCorrelationQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '\"' + param + '\":'

    switch (param) {
      case 'sid':
      case 'cid':
      case 'sgi':
      case 'max':
      case 'nd':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '\"' + params[param] + '\",'
        break
    }
  })

  // remove trailing comma
  queryString = removeTrailingComma(queryString)

  // add encoded braces
  queryString = encodeURIComponent('{') +
    encodeURIComponent(queryString) +
    encodeURIComponent('}')
  return queryString
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
