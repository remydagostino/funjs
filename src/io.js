(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./lambda'), require('./prelude'));
  }
  else {
    root.IO = factory(root.Lambda, root.prelude);
  }
})(this, function(Lambda, _) {
  'use strict';

  var IO = function(perform) {
    this.perform = perform;
  };

  _.of.case(
    _.testArgs(_.equals(IO), _.K(true)),
    function(t, a) {
      return new IO(_.K(a));
    }
  );

  _.mbind.case(
    _.testArgs(_.isType('function'), _.isInstance(IO)),
    function(fn, a) {
      return new IO(function() {
        return fn(a.perform()).perform();
      });
    }
  );

  _.fmap.case(
    _.testArgs(_.isType('function'), _.isInstance(IO)),
    function(fn, a) {
      return _.mbind(function(x) {
        return _.of(IO, fn(x));
      }, a);
    }
  );

  _.ap.case(
    _.testArgs(_.isInstance(IO), _.isInstance(IO)),
    function(a, b) {
      return _.mbind(function(f) {
        return _.fmap(f, b);
      }, a);
    }
  );

  return IO;
});

