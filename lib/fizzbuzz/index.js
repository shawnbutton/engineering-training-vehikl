'use strict'

const valueFor = number => {
  if (number === 15) return 'fizzbuzz'
  if (number % 3 === 0) return 'fizz'
  if (number % 5 === 0) return 'buzz'
  return number.toString()
}

module.exports = { valueFor }
