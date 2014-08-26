(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./lambda'));
  }
  else {
    root.prelude = factory(root.Lambda);
  }
})(this, function(Lambda) {
  'use strict';

  // Semigroup
  //  concat :: a -> a -> a
  var concat = Lambda(2);

  // Functor
  //  fmap :: (a -> b) -> f a -> f b
  var fmap = Lambda(2);

  // Applicative
  //  ap :: f (a -> b) -> f a -> f b
  var ap = Lambda(2);

  // Monad
  //  mbind :: (a -> m b) -> m a -> m b
  var mbind = Lambda(2);

  // Wrap a thing in a monadic type
  //  of :: a -> m a
  var of = Lambda(2);

  // Converts arguments to an array
  var toArray = function(a) {
    return Array.prototype.slice.call(a);
  };

  // Defines a constant value
  var K = function(v) {
    return function() { return v; };
  };

  // Glues functions together
  // (f . g)() == f(g())
  var compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Logic
  var equals = Lambda(2).default(function(a, b) {
    return a === b;
  });

  // Arithmatic
  var plus = Lambda(2).default(function(a, b) {
    return a + b;
  });

  var minus = Lambda(2).default(function(a, b) {
    return a - b;
  });

  var multiply = Lambda(2).default(function(a, b) {
    return a * b;
  });

  var divide = Lambda(2).default(function(a, b) {
    return b / a;
  });

  // Type Checking

  // Zips functions with arguments to produce a truth test
  var testArgs = function() {
    var tests = toArray(arguments);

    return function() {
      var args = arguments,
          isMatch = true,
          i;

      for (i in tests) {
        if (!tests[i](args[i])) {
          isMatch = false;
          break;
        }
      }

      return isMatch;
    };
  };

  // Returns true if fn is a constructor of a
  var isInstance = Lambda(2).default(function(fn, a) {
    return a instanceof fn;
  });

  var isNone = Lambda(1).default(function(a) {
    return typeof a === 'undefined' || a === null;
  });

  var hasMethod = Lambda(2).default(function(fnName, a) {
    return !isNone(a) && typeof a[fnName] === 'function';
  });

  // Returns true if typeof a evaluates to type
  var isType = Lambda(2).default(function(type, a) {
    return typeof a === type;
  });

  // Uses ES5 method to check if a is an array
  var isArray = function(a) {
    return Array.isArray(a);
  };

  // Reverses either an array or a string
  var reverse = Lambda(1).case(
    testArgs(isArray),
    function(a) {
      return a.reverse();
    }
  ).case(
    testArgs(isType('string')),
    function(a) {
      return a.split('').reverse().join('');
    }
  );

  var toUpperCase = function(str) {
    return str.toUpperCase();
  };

  var toLowerCase = function(str) {
    return str.toLowerCase();
  };


  // Fold / Reduce
  var foldl = Lambda(3).default(function(fn, initial, a) {
    return a.reduce(function(m, v) {
      return fn(m, v);
    }, initial);
  });

  var flatten = Lambda(1).case(isArray, foldl(concat, []));

  // Do syntax for extracting values from monads
  var Do = function(/*, monads, callback */) {
    var args = toArray(arguments),
        fn, monads;

    monads = args.slice(0, -1);
    fn     = args[args.length - 1];

    return monads.reduceRight(
      function(memo, a) {
        return function(xs) {
          return mbind(function(x) {
            return memo(xs.concat([x]));
          }, a);
        }
      },
      function(xs) {
        return fn.apply(this, xs);
      }
    )([]);
  };


  // Lifting
  // ... Monads
  var liftM = function(n, fn) {
    return Lambda(n).default(function() {
      return Do.apply(this, toArray(arguments).concat([fn]));
    });
  };

  // ... Applicatives
  var liftA = function(n, fn) {
    return Lambda(n).default(function(a1) {
      var args, result;

      return foldl(
        function(memo, a) {
          return ap(memo, a);
        },
        fmap(fn, a1),
        toArray(arguments).slice(1)
      );
    });
  };

  // =====================================
  // Arrays

  // Semigroup
  concat.case(
    testArgs(isArray, isArray),
    function(a, b) {
      return a.concat(b);
    }
  );

  // Functor
  fmap.case(
    testArgs(isType('function'), isArray),
    function(fn, a) {
      return a.map(function(v) {
        return fn(v);
      });
    }
  );

  mbind.case(
    testArgs(isType('function'), isArray),
    function(fn, a) {
      return flatten(fmap(fn, a));
    }
  );

  // Applicative Functor Apply
  ap.case(
    testArgs(isArray, isArray),
    function(fa, fb) {
      return flatten(fa.map(function(f) {
        return fmap(f, fb);
      }));
    }
  );

  of.case(
    testArgs(equals(Array), K(true)),
    function(t, a) {
      return [a];
    }
  );

  // =====================================
  // Functions
  fmap.case(
    testArgs(isType('function'), isType('function')),
    function(fn, fb) {
      return compose(fn, fb);
    }
  );

  // =====================================
  // Fantasy Land

  concat.case(
    testArgs(hasMethod('concat'), hasMethod('concat')),
    function(a, b) {
      return a.concat(b);
    }
  );

  fmap.case(
    testArgs(isType('function'), hasMethod('fmap')),
    function(fn, a) {
      return a.fmap(fn);
    }
  ).case(
    testArgs(isType('function'), hasMethod('map')),
    function(fn, a) {
      return a.map(fn);
    }
  );

  ap.case(
    testArgs(isType('function'), hasMethod('ap')),
    function(a, b) {
      return a.ap(b);
    }
  );

  mbind.case(
    testArgs(isType('function'), hasMethod('chain')),
    function(fn, a) {
      return a.chain(fn);
    }
  );

  of.case(
    testArgs(hasMethod('of'), K(true)),
    function(a, b) {
      return a.of(b);
    }
  );

  return {
    K: K,
    plus: plus,
    minus: minus,
    multiply: multiply,
    divide: divide,
    isInstance: isInstance,
    compose: compose,

    equals: equals,

    isType: isType,
    isNone: isNone,
    hasMethod: hasMethod,
    testArgs: testArgs,

    reverse: reverse,
    toUpperCase: toUpperCase,
    toLowerCase: toLowerCase,

    fmap: fmap,
    mbind: mbind,
    ap: ap,
    of: of,

    Do: Do,
    liftM: liftM,
    liftA: liftA,
  };
});
