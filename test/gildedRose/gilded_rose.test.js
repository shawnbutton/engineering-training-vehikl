'use strict'
/* eslint-env jest */

const gildedRose = require('../../lib/gildedRose/gilded_rose')

const makeSulfuras = () => new gildedRose.Item('Sulfuras, Hand of Ragnaros', 20, 80)

describe('Gilded Rose', () => {
  it('should never change the quality of Sulfuras', () => {
    const sulfuras = makeSulfuras()
    gildedRose.set_items([sulfuras])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(80)
  })

  it('should never change the sellin of Sulfuras', () => {
    const sulfuras = makeSulfuras()
    gildedRose.set_items([sulfuras])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].sell_in).toEqual(20)
  })

  it('should lower the sellIn by one for normal items', () => {
    const normalItem = new gildedRose.Item('+5 Dexterity Vest', 10, 20)
    gildedRose.set_items([normalItem])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].sell_in).toEqual(9)
  })

  it('should lower the quality by one for normal items', () => {
    const normalItem = new gildedRose.Item('+5 Dexterity Vest', 10, 20)
    gildedRose.set_items([normalItem])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(19)
  })

  it('should not lower the normal item quality below zero', () => {
    const normalItem = new gildedRose.Item('+5 Dexterity Vest', 10, 0)
    gildedRose.set_items([normalItem])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(0)
  })

  it('should lower the normal item quality twice as fast once the sell in date has passed', () => {
    const normalItem = new gildedRose.Item('+5 Dexterity Vest', -1, 20)
    gildedRose.set_items([normalItem])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(18)
  })

  it('should increase the quality of aged brie as it gets older', () => {
    const agedBrie = new gildedRose.Item('Aged Brie', 10, 25)
    gildedRose.set_items([agedBrie])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(26)
  })

  it('should not increase the quality of aged brie over max quality', () => {
    const agedBrie = new gildedRose.Item('Aged Brie', 10, 50)
    gildedRose.set_items([agedBrie])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(50)
  })

  it('should make backstage passes worthless once concert has happened', () => {
    const backStagePass = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 0, 20)
    gildedRose.set_items([backStagePass])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(0)
  })

  it('should increase backstage passes quality when the concert is more than 10 days away', () => {
    const backStagePass = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 11, 20)
    gildedRose.set_items([backStagePass])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(21)
  })

  it('should increase backstage passes quality twice as fast when the concert is 10 days away', () => {
    const backStagePass = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 10, 20)
    gildedRose.set_items([backStagePass])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(22)
  })

  it('should increase backstage passes quality three times as fast when the concert is 5 days away', () => {
    const backStagePass = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 5, 20)
    gildedRose.set_items([backStagePass])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(23)
  })

  it('should not increase backstage passes above max quality', () => {
    const backStagePassMoreThan10DaysAway = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 15, 50)
    const backStagePass10DaysAway = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 10, 50)
    const backStagePass5DaysAway = new gildedRose.Item('Backstage passes to a TAFKAL80ETC concert', 5, 50)
    gildedRose.set_items([backStagePassMoreThan10DaysAway, backStagePass10DaysAway, backStagePass5DaysAway])

    gildedRose.update_quality()

    expect(gildedRose.get_items()[0].quality).toEqual(50)
    expect(gildedRose.get_items()[1].quality).toEqual(50)
    expect(gildedRose.get_items()[2].quality).toEqual(50)
  })
})
