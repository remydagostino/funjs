var assert   = require('chai').assert,
    _        = require('../src/prelude'),
    Maybe    = require('../src/maybe')
    IO       = require('../src/io');

describe('IO Monad', function() {
  // :: IO number
  var randomNumber = function() {
    return new IO(function() {
      return Math.random();
    });
  };

  // :: IO Maybe number
  var maybeNumber = function() {
    return new IO(function() {
      var num = Math.random();

      if (num > 0.5) {
        return Maybe.some(num);
      }
      else {
        return Maybe.none();
      }
    });
  };

  it('generates random numbers', function() {
    var thing = _.Do(
      randomNumber(),
      randomNumber(),
      function(a, b) {
        console.log(a, b);

        return _.of(IO, a + b);
      }
    ).perform();

    console.log(thing);

    _.Do(
      _.liftA(2, _.plus)(randomNumber(), randomNumber()),
      function(a) {
        console.log('added', a);
        return _.of(IO, a);
      }
    ).perform();

    var things = _.Do(
      maybeNumber(),
      maybeNumber(),
      function(ma, mb) {
        console.log('this far');

        return _.of(IO, _.Do(
          ma,
          mb,
          function(a, b) {
            // Makes it here 25% of the time
            console.log('yes?', a, b);

            return _.of(Maybe, a + b);
          }
        ));
      }
    ).perform();

    console.log('things', things.isSome(), things);

    assert.equal(5,5);
  });
});
