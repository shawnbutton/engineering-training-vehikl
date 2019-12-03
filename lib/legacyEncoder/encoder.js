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

function prepareEncodeQuery (query) {
  return addBraces(encodeURIComponent(removeTrailingComma(query)))
}

const prepareQueryString = (query) => {
  return addBraces(removeTrailingComma(query))
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
    switch (key) {
      case 'sid':
        query = appendWithComma(query, value)
        break
      case 'apikey':
        query = appendWithQuotes(query, value)
        break
      case 'nid':
        query = appendInBrackets(query, value)
        break
    }
  })

  return prepareQueryString(query)
}

const tacos = (query, key, value) => {
  switch (key) {
    case 'sid':
    case 'nid':
    case 'pid':
    case 'sgi':
      return appendWithComma(query, value)
    case 'apikey':
      return appendWithQuotes(query, value)
  }
  return query
}

const encodeSegmentQueryString = params => {
  let query = ''

  Object.keys(params).forEach(key => {
    query = appendWithColon(query, key)

    const value = params[key]
    query = tacos(query, key, value)
  })

  return prepareQueryString(query)
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

  return prepareQueryString(query)
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

  return prepareQueryString(query)
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

  return prepareQueryString(query)
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

  return prepareEncodeQuery(query)
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

  return prepareEncodeQuery(query)
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
