var assert   = require('chai').assert,
    _        = require('../src/prelude'),
    Maybe    = require('../src/maybe');

describe('Maybe Monad', function() {
  var intHalve = function(a) {
    if (a % 2 === 0) {
      return Maybe.some(a / 2);
    }
    else {
      return Maybe.none();
    }
  };

  var intHalveM = _.mbind(intHalve);

  it('Halves 20 twice', function() {
    var result = _.compose(intHalveM, intHalve)(20);

    assert.isTrue(result.isSome());
    assert.equal(result.value(), 5);
  });


  it('Halves 20 not three times', function() {
    var result = _.compose(intHalveM, intHalveM, intHalve)(20);

    assert.isFalse(result.isSome());
  });

  it('Halves 20 not four times', function() {
    var result = _.compose(intHalveM, intHalveM, intHalveM, intHalve)(20);

    assert.isFalse(result.isSome());
  });
});

