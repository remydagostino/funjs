(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./lambda'), require('./prelude'));
  }
  else {
    root.Maybe = factory(root.Lambda, root.prelude);
  }
})(this, function(Lambda, _) {
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

  _.fmap.case(
    _.testArgs(_.isType('function'), _.isInstance(Maybe)),
    function(fn, a) {
      if (a.isSome()) {
        return Maybe.some(fn(a.value()));
      }
      else {
        return Maybe.none();
      }
    }
  );

  _.mbind.case(
    _.testArgs(_.isType('function'), _.isInstance(Maybe)),
    function(fn, a) {
      if (a.isSome()) {
        return fn(a.value());
      }
      else {
        return Maybe.none();
      }
    }
  );

  _.ap.case(
    _.testArgs(_.isInstance(Maybe), _.isInstance(Maybe)),
    function(a, b) {
      if (a.isSome() && b.isSome()) {
        return Maybe.some(a.value()(b.value()));
      }
      else {
        return Maybe.none();
      }
    }
  );

  _.of.case(
    _.testArgs(_.equals(Maybe), _.K(true)),
    function(t, a) {
      if (a === null || a === undefined) {
        return Maybe.none();
      }
      else {
        return Maybe.some(a);
      }
    }
  );

  return Maybe;
});
