module.exports = {
  encodeTopLeakSitesString: function (data) {
    var ret = [];
    for (var d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURI(data[d]));
    return ret.join('&');
  },
  encodeNodeQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;

        case 'nid':
          var nIdValue = params[param];
          queryString += '[' + nIdValue + '],';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);
    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodeSegmentQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
        case 'nid':
        case 'pid':
        case 'sgi':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodePipeQueryString: function (params) {
    var queryString  = '';

    //for each parameter enclose in quotes if key or string
    for (var param in params) {
      queryString += '\"' + param + '\":';
      if (isNaN(params[param])) {
        queryString += '\"' + params[param] + '\",';
      } else {
        queryString += params[param] + ',';
      }
    }

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodePipeRepairQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
        case 'pid':
        case 'poi':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodeSpectrumRepairQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;

        default:
          queryString += params[param] + ',';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodePoiQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;

        default:
          queryString += params[param] + ',';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      queryString +
      encodeURIComponent('}');
    return queryString;
  },
  encodeMeasurementQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
        case 'nid':
        case 'mt':
        case 'sc':
        case 'max':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      encodeURIComponent(queryString) +
      encodeURIComponent('}');
    return queryString;
  },
  encodeMeasurementCsvQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
        case 'nid':
        case 'mt':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      encodeURIComponent(queryString) +
      encodeURIComponent('}');
    return queryString;
  },
  encodeCorrelationQueryString: function (params) {
    var queryString  = '';

    Object.keys(params).map(function(param) {
      queryString += '\"' + param + '\":';

      switch (param) {
        case 'sid':
        case 'cid':
        case 'sgi':
        case 'max':
        case 'nd':
          queryString += params[param] + ',';
          break;

        case 'apikey':
          queryString += '\"' + params[param] + '\",';
          break;
      }
    });

    //remove trailing comma
    queryString = queryString.substring(0, queryString.length - 1);

    //add encoded braces
    queryString = encodeURIComponent('{') +
      encodeURIComponent(queryString) +
      encodeURIComponent('}');
    return queryString;
  }
};
