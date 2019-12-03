'use strict'

const isDivisibleBy = divisor => number => number % divisor === 0
const isDivisibleByThree = isDivisibleBy(3)
const isDivisibleByFive = isDivisibleBy(5)

const valueFor = number => {
  if (isDivisibleByThree(number) && isDivisibleByFive(number)) return 'fizzbuzz'
  if (isDivisibleByThree(number)) return 'fizz'
  if (isDivisibleByFive(number)) return 'buzz'
  return number.toString()
}

module.exports = { valueFor }
