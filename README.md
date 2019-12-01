# Getting Started
You need to clone the repo to a local folder, run `yarn install` and
`yarn test`:
```bash
git clone https://github.com/shawnbutton/engineering-training-vehikl
cd engineering-training-vehikl
yarn install
yarn test
```

You should see something like:

```
➜  engineering-training-vehikl git:(master) ✗ yarn install       
yarn install v1.9.4
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 📃  Building fresh packages...
✨  Done in 5.76s.
➜  engineering-training-vehikl git:(master) ✗ yarn test
yarn run v1.9.4
$ jest
 PASS  test/gildedRose/approval.test.js
 PASS  test/legacyEncoder/encoderCharacterization.test.js
 PASS  test/gildedRose/gilded_rose.test.js
 PASS  test/romanNumerals/kata.test.js
 PASS  test/kata/kata.test.js
 PASS  test/fizzbuzz/index.test.js
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |    90.86 |    87.84 |    94.12 |    91.46 |                   |
 fizzbuzz        |      100 |      100 |      100 |      100 |                   |
  index.js       |      100 |      100 |      100 |      100 |                   |
 gildedRose      |      100 |    97.06 |      100 |      100 |                   |
  gilded_rose.js |      100 |    97.06 |      100 |      100 |                58 |
 kata            |      100 |      100 |      100 |      100 |                   |
  kata.js        |      100 |      100 |      100 |      100 |                   |
 legacyEncoder   |    87.69 |       80 |    92.59 |    88.33 |                   |
  encoder.js     |    87.69 |       80 |    92.59 |    88.33 |... 04,205,234,235 |
 romanNumerals   |      100 |      100 |      100 |      100 |                   |
  index.js       |      100 |      100 |      100 |      100 |                   |
-----------------|----------|----------|----------|----------|-------------------|

Test Suites: 6 passed, 6 total
Tests:       29 passed, 29 total
Snapshots:   1 passed, 1 total
Time:        1.248s
Ran all test suites.
✨  Done in 2.90s.
```
