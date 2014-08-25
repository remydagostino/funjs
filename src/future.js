(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./lambda'), require('./prelude'));
  }
  else {
    root.Future = factory(root.Lambda, root.prelude);
  }
})(this, function(Lambda, _) {
  'use strict';

  var Future = function(perform) {
    this.get = this.perform = function(cb) {
      if (perform.length === 0) {
        if (_.isType('function', cb)) {
          cb(perform());
        }
      }
      else {
        perform(function(result) {
          if (_.isType('function', cb)) {
            cb(result);
          }
        });
      }
    };
  };

  // Handles promises and constants
  _.of.case(
    _.testArgs(_.equals(Future), _.K(true)),
    function(t, a) {
      return new Future(function(done) {
        if (a.then) {
          a.then(done);
        }
        else {
          done(a);
        }
      });
    }
  );

  _.mbind.case(
    _.testArgs(_.isType('function'), _.isInstance(Future)),
    function(fn, a) {
      return new Future(function(done) {
        return a.get(function(x) {
          fn(x).get(done);
        });
      });
    }
  );

  _.fmap.case(
    _.testArgs(_.isType('function'), _.isInstance(Future)),
    function(fn, a) {
      return _.mbind(function(x) {
        return _.of(Future, fn(x));
      }, a);
    }
  );

  _.ap.case(
    _.testArgs(_.isInstance(Future), _.isInstance(Future)),
    function(a, b) {
      return _.mbind(function(f) {
        return _.fmap(f, b);
      }, a);
    }
  );

  return Future;
});

