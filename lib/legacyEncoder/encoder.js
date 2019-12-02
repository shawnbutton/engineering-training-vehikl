const ENCODED_LEFT_BRACE = encodeURIComponent('{')
const ENCODED_RIGHT_BRACE = encodeURIComponent('}')

const removeTrailingComma = queryString => queryString.substring(0, queryString.length - 1)

const addComma = value => value + ','

const inQuotes = value => `"${value}",`

const inBrackets = nIdValue => `[${nIdValue}],`

const appendWithComma = (queryString, value) => queryString + addComma(value)

const appendWithQuotes = (queryString, value) => queryString + inQuotes(value)

const appendInBrackets = (queryString, nIdValue) => queryString + inBrackets(nIdValue)

const appendWithColon = (queryString, param) => queryString + `"${param}":`

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

const encodeSegmentQueryString = params => {
  return encodeQuery(params, ['apikey'], ['sid', 'nid', 'pid', 'sqi'])
}
const encodePipeQueryString = params => {
  let queryString = ''

  // for each parameter enclose in quotes if key or string
  for (const param in params) {
    queryString += '"' + param + '":'
    if (isNaN(params[param])) {
      queryString += '"' + params[param] + '",'
    } else {
      queryString += params[param] + ','
    }
  }
  queryString = removeTrailingComma(queryString)

  return addBraces(queryString)
}
const encodePipeRepairQueryString = params => {
  return encodeQuery(params, ['apikey'], ['sid', 'pid', 'poi'])
}

const encodeSpectrumRepairQueryString = object => {
  return encodeQuery(object, ['apikey'])
}

const encodePoiQueryString = object => {
  return encodeQuery(object, ['apikey'])
}

const encodeQuery = (object, quotedValues, values) => {
  const parts = []

  Object
    .keys(object)
    .forEach(function (key) { parts.push(encodePart(key, object[key], quotedValues, values)) })

  return encodeURIComponent('{') + removeTrailingComma(parts.join('')) + encodeURIComponent('}')
}

const encodePart = (key, value, quoteValues, values) => {
  if (quoteValues.includes(key)) {
    return `"${key}":"${value}",`
  } else if (values === undefined) {
    return `"${key}":${value},`
  } else if (values.includes(key)) {
    return `"${key}":${value},`
  } else {
    return `"${key}":`
  }
}
const encodeMeasurementQueryString = params => {
  let queryString = ''

  Object.keys(params).forEach(function (param) {
    queryString += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'nid':
      case 'mt':
      case 'sc':
      case 'max':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '"' + params[param] + '",'
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
    queryString += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'nid':
      case 'mt':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '"' + params[param] + '",'
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
    queryString += '"' + param + '":'

    switch (param) {
      case 'sid':
      case 'cid':
      case 'sgi':
      case 'max':
      case 'nd':
        queryString += params[param] + ','
        break

      case 'apikey':
        queryString += '"' + params[param] + '",'
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
