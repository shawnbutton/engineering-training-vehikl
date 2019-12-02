'use strict'
/* eslint-env jest */

const sut = require('../../lib/triviaScorer')

describe('trivia scorer', () => {
  it('should do something', () => {
    const given = ''

    const expected = 0

    const result = sut.score(given)

    expect(result).toEqual(expected)
  })
})
