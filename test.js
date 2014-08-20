var assert   = require('chai').assert,
    al       = require('./algebras'),
    Maybe    = al.Maybe;

describe('Something', function() {
  it('has curried functions', function() {
    assert.equal(al.plus(1,2), 3);
    assert.equal(al.plus(1)(2), 3);
  });

  it('maps over lists', function() {
    assert.deepEqual(
      al.fmap(al.plus(1), [1,2,3,4]),
      [2,3,4,5]
    );
  });

  it('maps over maybe', function() {
    var thing, otherThing;

    thing = al.Maybe.some(10);

    assert.equal(
      al.fmap(al.plus(2), thing).value(),
      12
    );

    otherThing = al.Maybe.none();

    assert.equal(
      al.fmap(al.plus(2), otherThing).isSome(),
      false
    );
  });
});

describe('Maybe Monad', function() {
  var intHalve = function(a) {
    if (a % 2 === 0) {
      return al.Maybe.some(a / 2);
    }
    else {
      return al.Maybe.none();
    }
  };

  var intHalveM = al.chain(intHalve);

  it('Halves 20 twice', function() {
    var result = al.compose(intHalveM, intHalve)(20);

    assert.isTrue(result.isSome());
    assert.equal(result.value(), 5);
  });


  it('Halves 20 not three times', function() {
    var result = al.compose(intHalveM, intHalveM, intHalve)(20);

    assert.isFalse(result.isSome());
  });

  it('Halves 20 not four times', function() {
    var result = al.compose(intHalveM, intHalveM, intHalveM, intHalve)(20);

    assert.isFalse(result.isSome());
  });
});

describe('Applicative Arrays', function() {
  it('maps functions across inputs', function() {
    var result = al.ap([al.multiply(2), al.plus(3)], [1, 2, 3]);

    assert.deepEqual(result, [2, 4, 6, 4, 5, 6]);
  });

  it('maps multiple arity functions', function() {
    var result = al.ap(al.ap([al.multiply, al.plus], [1, 2]), [3, 4]);

    assert.deepEqual(result, [3, 4, 6, 8, 4, 5, 5, 6]);
  });

  it('maps functions inside maybes', function() {
    var result = al.liftA(2, al.plus)(Maybe.some(5), Maybe.some(4));

    assert.isTrue(result.isSome());
    assert.equal(result.value(), 9);
  });

  it('Maybes with no value', function() {
    var result = al.liftA(2, al.plus)(Maybe.none(), Maybe.some(4));

    assert.isFalse(result.isSome());
  });
});

describe('Monadic Lift', function() {
  var maybeDivide = al.Lambda(2).default(function(divisor, a) {
    if (divisor === 0) {
      return Maybe.none();
    }
    else {
      return Maybe.some(a / divisor);
    }
  });

  var maybeDivideM = al.liftM(2, maybeDivide);

  it('accepts two maybes', function() {
    var result = maybeDivideM(Maybe.some(2), Maybe.some(10));

    assert.isTrue(result.isSome());
    assert.equal(result.value(), 5);
  });

  it('accepts two maybes and unwraps their values', function() {
    var result = maybeDivideM(Maybe.some(0), Maybe.some(10));

    assert.isFalse(result.isSome());
  });

  it('accepts two maybes and behaves properly when `none`', function() {
    var result = maybeDivideM(Maybe.some(2), Maybe.none());

    assert.isFalse(result.isSome());
  });
});

describe('Do notation', function() {
  it('unwraps arrays', function() {
    var result = al.Do(
      ['a', 'b'],
      ['x', 'y'],
      function(a1, a2) {
        return al.of(Array, [a1, a2]);
      }
    );

    assert.deepEqual(result, [['a','x'],['a','y'],['b','x'],['b','y']]);
  });

  it('unwraps maybes', function() {
    var result = al.Do(
      Maybe.some('Hello'),
      Maybe.some('World'),
      function(a1, a2) {
        return al.of(Maybe, [a1 + ' ' + a2]);
      }
    );

    assert.isTrue(result.isSome());
    assert.equal(result.value(), 'Hello World');
  });
});

describe('Map over functions', function() {
  var reverseUpper = al.fmap(al.reverse, al.toUpperCase);

  it('composes two string functions', function() {
    assert.equal(reverseUpper('Hello'), 'OLLEH');
  });
});

