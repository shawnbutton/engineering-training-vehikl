'use strict'
/* eslint-env jest */

const sut = require('../../lib/legacyEncoder/encoder')

const makeDefaultGiven = () => ({
  field1: 'field value',
  number: 123,
  url: 'http://some.url?foreignChars=шеллы',
  apiKey: 'apikey value',
  gid: 'gid value',
  max: 'max value',
  nid: 'nid value',
  nd: 'nd value',
  pid: 'pid value',
  poi: 'poi value',
  sid: 'sid value'
})

describe('encoder characterization tests', () => {
  describe('encodeTopLeakSitesString', () => {
    it('should combine two strings without encoding', () => {
      const result = sut.encodeTopLeakSitesString(makeDefaultGiven())
      expect(result).toEqual('field1=field%20value&number=123&url=http://some.url?foreignChars=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&apiKey=apikey%20value&gid=gid%20value&max=max%20value&nid=nid%20value&nd=nd%20value&pid=pid%20value&poi=poi%20value&sid=sid%20value')
    })

    it('should return empty string for empty object', () => {
      const result = sut.encodeTopLeakSitesString({})
      expect(result).toEqual('')
    })

    it('should combine array members', () => {
      const given = ['a', 'b']
      const result = sut.encodeTopLeakSitesString(given)
      expect(result).toEqual('0=a&1=b')
    })
  })

  describe('encodeNodeQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeNodeQueryString(given)
      expect(result).toEqual('%7B"field1":"number":"url":"apiKey":"gid":"max":"nid":[nid value],"nd":"pid":"poi":"sid":sid value%7D')
    })
  })

  describe('encodeSegmentQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeSegmentQueryString(given)
      expect(result).toEqual('%7B"field1":"number":"url":"apiKey":"gid":"max":"nid":nid value,"nd":"pid":pid value,"poi":"sid":sid value%7D')
    })
  })

  describe('encodePipeQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodePipeQueryString(given)
      expect(result).toEqual('%7B"field1":"field value","number":123,"url":"http://some.url?foreignChars=шеллы","apiKey":"apikey value","gid":"gid value","max":"max value","nid":"nid value","nd":"nd value","pid":"pid value","poi":"poi value","sid":"sid value"%7D')
    })
  })

  describe('encodePipeRepairQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodePipeRepairQueryString(given)
      expect(result).toEqual('%7B"field1":"number":"url":"apiKey":"gid":"max":"nid":"nd":"pid":pid value,"poi":poi value,"sid":sid value%7D')
    })
  })

  describe('encodeSpectrumRepairQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeSpectrumRepairQueryString(given)
      expect(result).toEqual('%7B"field1":field value,"number":123,"url":http://some.url?foreignChars=шеллы,"apiKey":apikey value,"gid":gid value,"max":max value,"nid":nid value,"nd":nd value,"pid":pid value,"poi":poi value,"sid":sid value%7D')
    })
  })

  describe('encodePoiQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodePoiQueryString(given)
      expect(result).toEqual('%7B"field1":field value,"number":123,"url":http://some.url?foreignChars=шеллы,"apiKey":apikey value,"gid":gid value,"max":max value,"nid":nid value,"nd":nd value,"pid":pid value,"poi":poi value,"sid":sid value%7D')
    })
  })

  describe('encodeMeasurementQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeMeasurementQueryString(given)
      expect(result).toEqual('%7B%22field1%22%3A%22number%22%3A%22url%22%3A%22apiKey%22%3A%22gid%22%3A%22max%22%3Amax%20value%2C%22nid%22%3Anid%20value%2C%22nd%22%3A%22pid%22%3A%22poi%22%3A%22sid%22%3Asid%20value%7D')
    })
  })

  describe('encodeMeasurementCsvQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeMeasurementCsvQueryString(given)
      expect(result).toEqual('%7B%22field1%22%3A%22number%22%3A%22url%22%3A%22apiKey%22%3A%22gid%22%3A%22max%22%3A%22nid%22%3Anid%20value%2C%22nd%22%3A%22pid%22%3A%22poi%22%3A%22sid%22%3Asid%20value%7D')
    })
  })

  describe('encodeCorrelationQueryString', () => {
    it('should combine object fields into string', () => {
      const given = makeDefaultGiven()

      const result = sut.encodeCorrelationQueryString(given)
      expect(result).toEqual('%7B%22field1%22%3A%22number%22%3A%22url%22%3A%22apiKey%22%3A%22gid%22%3A%22max%22%3Amax%20value%2C%22nid%22%3A%22nd%22%3And%20value%2C%22pid%22%3A%22poi%22%3A%22sid%22%3Asid%20value%7D')
    })
  })
})
