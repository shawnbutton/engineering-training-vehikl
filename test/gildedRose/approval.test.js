'use strict'
/* eslint-env jest */

const gildedRose = require('../../lib/gildedRose/gilded_rose')

const names = ['+5 Dexterity Vest',
  'Aged Brie',
  'Backstage passes to a TAFKAL80ETC concert',
  'Elixir of the Mongoose']

const makeItems = () => {
  const items = []
  for (let itemType = 0; itemType <= 3; itemType++) {
    for (let qualityIndex = -5; qualityIndex < 55; qualityIndex += 5) {
      for (let sellInIndex = -1; sellInIndex < 20; sellInIndex += 5) {
        items.push(new gildedRose.Item(names[itemType], sellInIndex, qualityIndex))
      }
    }
  }
  items.push(new gildedRose.Item('Sulfuras, Hand of Ragnaros', 0, 80))
  return items
}

describe('Gilded Rose Approval Test', () => {
  it('should have the same result as expected', () => {
    const items = makeItems()
    gildedRose.set_items(items)

    let data = ''
    for (let day = 1; day <= 60; day++) {
      gildedRose.update_quality()
      gildedRose.get_items().forEach(item => {
        data += 'name:' + item.name + ' sell_in:' + item.sell_in + ' quality:' + item.quality + '\n'
      })
    }

    expect(data).toMatchSnapshot()
  })
})
