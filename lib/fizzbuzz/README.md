# Fizzbuzz

## Background
Fizzbuzz is a group word game for children to teach them about division.

Players take turns to count incrementally, replacing any number divisible by 3 with the word "fizz", any number divisible by 5 with the word "buzz", and any number divisible by 3 and 5 with the word "fizzbuzz". 

## Kata
Create a function ```fizBuzz(number : int) : string``` that returns a string according to the rules of Fizzbuzz:

```
fizzbuzz.valueFor(1);  // "1"
fizzbuzz.valueFor(2);  // "2"
fizzbuzz.valueFor(3);  // "fizz"
fizzbuzz.valueFor(4);  // "4"
fizzbuzz.valueFor(5);  // "buzz"
fizzbuzz.valueFor(6);  // "fizz"
...
fizzbuzz.valueFor(15); // "fizzbuzz"
```

## Bonus Variation
Also return "fizz" if the number contains the digit "3" and "buzz" if the number contains digit "5":

```
fizzbuzz.valueFor(1);  // "1"
fizzbuzz.valueFor(2);  // "2"
fizzbuzz.valueFor(3);  // "fizz"
fizzbuzz.valueFor(4);  // "4"
fizzbuzz.valueFor(5);  // "buzz"
fizzbuzz.valueFor(6);  // "fizz"
...
fizzbuzz.valueFor(13); // "fizz"
fizzbuzz.valueFor(14); // "14"
fizzbuzz.valueFor(15); // "fizzbuzz"
...
fizzbuzz.valueFor(20); // "buzz"
fizzbuzz.valueFor(21); // "fizz"
fizzbuzz.valueFor(22); // "22"
fizzbuzz.valueFor(23); // "fizz"
...
fizzbuzz.valueFor(30); // "fizzbuzz"

```
