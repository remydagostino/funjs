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
  IO.of = function(a) {
    return new IO(function(done) {
      if (a.then) {
        a.then(done);
      }
      else {
        done(a);
      }
    });
  };

  IO.prototype.chain = function(fn) {
    var self = this;

    return new IO(function(done) {
      return self.get(function(x) {
        fn(x).get(done);
      });
    });
  };

  IO.prototype.fmap = function(fn) {
    return this.chain(function(x) {
      return IO.of(fn(x));
    });
  };

  IO.prototype.ap = function(a) {
    return this.chain(function(f) {
      return a.fmap(f);
    });
  };

  return IO;
});

