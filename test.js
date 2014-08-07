var assert   = require('chai').assert,
    al       = require('./algebras');

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

