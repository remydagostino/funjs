var assert = require('chai').assert,
    _      = require('../src/prelude');

describe('Prelude helpers', function() {
  describe('Applicative Arrays', function() {
    it('maps functions across inputs', function() {
      var result = _.ap([_.multiply(2), _.plus(3)], [1, 2, 3]);

      assert.deepEqual(result, [2, 4, 6, 4, 5, 6]);
    });

    it('maps multiple arity functions', function() {
      var result = _.ap(_.ap([_.multiply, _.plus], [1, 2]), [3, 4]);

      assert.deepEqual(result, [3, 4, 6, 8, 4, 5, 5, 6]);
    });
  });
});
