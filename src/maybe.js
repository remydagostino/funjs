(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./lambda'), require('./prelude'));
  }
  else {
    root.Maybe = factory(root.Lambda, root.prelude);
  }
})(this, function(Lambda, _) {
  'use strict';

  var Maybe = function(isSomething, value) {
    this.isSome = _.K(!!isSomething);
    this.value  = _.K(value);
  };

  Maybe.some = function(value) {
    return new Maybe(true, value);
  };

  Maybe.none = function() {
    return new Maybe(false);
  };

  Maybe.prototype.fmap = function(fn) {
    if (this.isSome()) {
      return Maybe.some(fn(this.value()));
    }
    else {
      return Maybe.none();
    }
  };

  Maybe.prototype.map = Maybe.prototype.fmap;

  Maybe.prototype.chain = function(fn) {
    if (this.isSome()) {
      return fn(this.value());
    }
    else {
      return Maybe.none();
    }
  };

  Maybe.prototype.ap = function(a) {
    if (this.isSome() && a.isSome()) {
      return Maybe.some(this.value()(a.value()));
    }
    else {
      return Maybe.none();
    }
  };

  Maybe.of = function(a) {
    if (a === null || a === undefined) {
      return Maybe.none();
    }
    else {
      return Maybe.some(a);
    }
  };

  return Maybe;
});
