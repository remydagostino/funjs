var assert   = require('chai').assert,
    _        = require('../src/prelude'),
    Maybe    = require('../src/maybe')
    IO       = require('../src/io');

describe('Future/IO Monad', function() {
  // :: IO number
  var timeout = function(time, value) {
    return new IO(function(done) {
      setTimeout(function() {
        done(value);
      }, time);
    });
  };

  it('chains async operations together', function(done) {
    _.Do(
      timeout(200, 'A'),
      timeout(100, 'B'),
      function(a, b) {
        assert.equal(a, 'A');
        assert.equal(b, 'B');

        return _.of(IO, a + b);
      }
    ).get(function(x) {
      assert.equal(x, 'AB');
      done();
    });
  });

  it('doubles as IO', function(done) {
    _.Do(
      new IO(_.K('A')),
      timeout(100, 'B'),
      function(a, b) {
        assert.equal(a, 'A');
        assert.equal(b, 'B');

        return _.of(IO, a + b);
      }
    ).perform(function(x) {
      assert.equal(x, 'AB');
      done();
    });
  });
});

