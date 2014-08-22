var assert   = require('chai').assert,
    Lambda   = require('../src/lambda');

describe('Lambda constructor', function() {
  var join = Lambda(2);

  // Create a case where two numbers multiply
  join.case(
    function(a, b) {
      return typeof a === 'number' && typeof b === 'number';
    },
    function(a, b) {
      return a * b;
    }
  );

  // Repeat the string if we get a string and a number
  join.case(
    function(a, b) {
      return typeof a === 'string' && typeof b === 'number';
    },
    function(a, b) {
      return Array(b + 1).join(a);
    }
  );

  it('curries provided functions', function() {
    assert.equal(join(2,3), 6);
    assert.equal(join(5)(2), 10);
    assert.equal(join()()(10, 10), 100);
  });

  it('switches between cases', function() {
    assert.equal(join(5,3), 15);
    assert.equal(join('Hello', 3), 'HelloHelloHello');
  });

  it('throws with no suitable case', function() {
    assert.throws(function() {
      return join({}, []);
    });
  });

  it('can have a default case supplied', function() {
    var join2 = join.clone().default(function(a, b) {
      return a + b;
    });

    assert.equal(join2('Hello ', {}), 'Hello [object Object]');
  });
});

