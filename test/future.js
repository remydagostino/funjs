var assert   = require('chai').assert,
    _        = require('../src/prelude'),
    Maybe    = require('../src/maybe')
    Future   = require('../src/future');

describe('Future Monad', function() {
  // :: IO number
  var timeout = function(time, value) {
    return new Future(function(done) {
      setTimeout(function() {
        console.log('thing', value);
        done(value);
      }, time);
    });
  };

  it('operates in the future', function(done) {
    var thing = _.Do(
      timeout(200, 'A'),
      timeout(100, 'B'),
      function(a, b) {
        assert.equal(a, 'A');
        assert.equal(b, 'B');

        return _.of(Future, a + b);
      }
    ).get(function(x) {
      assert.equal(x, 'AB');
      done();
    });

    assert.equal(5,5);
  });
});

