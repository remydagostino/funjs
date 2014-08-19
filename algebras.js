// Turns arguments into array
var argsToArray = function(args) {
  return Array.prototype.slice.call(args);
};

// Creates an auto-curried pattern matching function
// that can be extended with .case(predicate, expression)
var Lambda = function(numArgs) {
  var guard, fn, tests, defaultCase;

  tests       = [];
  defaultCase = null;

  fn = function() {
    var i, test, result;

    for (i = 0; i < tests.length; i++) {
      test = tests[i];

      if (test.predicate.apply(this, arguments) === true) {
        return test.expression.apply(this, arguments);
      }
    }

    if (defaultCase !== null) {
      return defaultCase.apply(this, arguments);
    }
    else {
      throw new Error('No matching case found for: ' + argsToArray(arguments));
    }
  };

  guard = function() {
    var args = arguments;

    if (args.length < numArgs) {
      return function innerGuard() {
        var allArgs = argsToArray(args).concat(argsToArray(arguments));
        return guard.apply(this, allArgs);
      };
    }
    else {
      // Call the function
      return fn.apply(this, args);
    }
  };

  guard.case = function(predicate, expression) {
    tests.push({ predicate: predicate, expression: expression });
    return guard;
  };

  guard.default = function(expression) {
    defaultCase = expression;
    return guard;
  };

  return guard;
};

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
//  chain :: (a -> m b) -> m a -> m b
var chain = Lambda(2);

// Wrap a thing in a monadic type
//  of :: a -> m a
var of = Lambda(2);

// Zips functions with arguments to produce a truth test
var testArgs = function() {
  var tests = argsToArray(arguments);

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

// Constants
var K = function(v) {
  return function() { return v; };
};

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
var isInstance = Lambda(2).default(function(fn, a) {
  return a instanceof fn;
});

var isType = Lambda(2).default(function(type, a) {
  return typeof a === type;
});

var isArray = function(a) { return Array.isArray(a); };

// Strings
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


var Do = function(type /*, monads, callback */) {
  var args = argsToArray(arguments),
      cb;

  cb = foldl(
    function(memo, monad) {
      return compose(memo, function() {
        return;
      });
    },
    compose(of(type), args[args.length - 1]),
    args.slice(1, -1)
  );

};


// Lifting
// ... Monads
var liftM2 = Lambda(3).default(function(fn, a1, a2) {
  return chain(
    function(x1) {
      return chain(
        function(x2) {
          return fn(x1, x2);
        },
        a2
      );
    },
    a1
  );

  return compose(
    function(xs) {
      return fn.apply(this, xs);
    },
    function(xs) {
      return chain(function(x2) {
        return xs.concat([x2]);
      }, a2);
    },
    function(xs) {
      return chain(function(x1) {
        return xs.concat([x1]);
      }, a1);
    }
  )([]);
});

var liftM3 = Lambda(4).default(function(fn, a1, a2, a3) {
  return chain(chain(chain(fn, a1), a2), a3);
});

var liftM4 = Lambda(3).default(function(fn, a1, a2, a3, a4) {
  return chain(chain(chain(chain(fn, a1), a2), a3, a4));
});

var liftMx = function(n, fn) {
  return Lambda(n).default(function() {
    var args;

    args = argsToArray(arguments);

    return chain(args[0], function(a1) {
      return chain(args[1], function(a2) {
        return fn(a1, a2);
      });
    });
  });
};

// ... Applicatives
var liftA2 = Lambda(3).default(function(fn, a1, a2) {
  return ap(fmap(fn, a1), a2);
});

var liftA3 = Lambda(4).default(function(fn, a1, a2, a3) {
  return ap(ap(fmap(fn, a1), a2), a3);
});

var liftA4 = Lambda(5).default(function(fn, a1, a2, a3, a4) {
  return ap(ap(ap(fmap(fn, a1), a2), a3), a4);
});

// =====================================
// Arrays

// Semigroup
concat = concat.case(
  testArgs(isArray, isArray),
  function(a, b) {
    return a.concat(b);
  }
);

// Functor
fmap = fmap.case(
  testArgs(isType('function'), isArray),
  function(fn, a) {
    return a.map(function(v) {
      return fn(v);
    });
  }
);

chain = chain.case(
  testArgs(isType('function'), isArray),
  function(fn, a) {
    return flatten(fmap(fn, a));
  }
);

// Applicative Functor Apply
ap = ap.case(
  testArgs(isArray, isArray),
  function(fa, fb) {
    return flatten(fa.map(function(f) {
      return fmap(f, fb);
    }));
  }
);

// =====================================
// Functions
fmap = fmap.case(
  testArgs(isType('function'), isType('function')),
  function(fn, fb) {
    return compose(fn, fb);
  }
);


// =====================================
// Maybe

var Maybe = function(isSomething, value) {
  this.isSome = K(!!isSomething);
  this.value  = K(value);
};

Maybe.some = function(value) {
  return new Maybe(true, value);
};

Maybe.none = function() {
  return new Maybe(false);
};

fmap = fmap.case(
  testArgs(isType('function'), isInstance(Maybe)),
  function(fn, a) {
    if (a.isSome()) {
      return Maybe.some(fn(a.value()));
    }
    else {
      return Maybe.none();
    }
  }
);

chain = chain.case(
  testArgs(isType('function'), isInstance(Maybe)),
  function(fn, a) {
    if (a.isSome()) {
      return fn(a.value());
    }
    else {
      return Maybe.none();
    }
  }
);

ap = ap.case(
  testArgs(isInstance(Maybe), isInstance(Maybe)),
  function(a, b) {
    if (a.isSome() && b.isSome()) {
      return Maybe.some(a.value()(b.value()));
    }
    else {
      return Maybe.none();
    }
  }
);


module.exports = {
  Lambda: Lambda,
  K: K,
  plus: plus,
  minus: minus,
  multiply: multiply,
  divide: divide,
  isInstance: isInstance,
  compose: compose,
  isType: isType,

  reverse: reverse,
  toUpperCase: toUpperCase,
  toLowerCase: toLowerCase,

  fmap: fmap,
  chain: chain,
  ap: ap,

  liftM2: liftM2,
  liftM3: liftM3,
  liftM4: liftM4,
  liftA2: liftA2,
  liftA3: liftA3,
  liftA4: liftA4,

  Maybe: Maybe
};
