// Turns arguments into array
var argsToArray = function(args) {
  return Array.prototype.slice.call(args);
};

// Creates an auto-curried pattern matching function
// that can be extended with .case(predicate, expression)
var Lambda = function(numArgs) {
  var guard, fn, tests;

  tests = [];

  fn = function() {
    var i, test, result;

    for (i = 0; i < tests.length; i++) {
      test = tests[i];

      if (test.predicate.apply(this, arguments) === true) {
        return test.expression.apply(this, arguments);
      }
    }

    throw new Error('No matching case found for: ' + argsToArray(arguments));
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

  return guard;
};

// Constants
var K = function(v) {
  return function() { return v; };
};

// Functor Map
var fmap = Lambda(2).case(
  function(fn, a) {
    return typeof fn == 'function' && Array.isArray(a);
  },
  function(fn, a) { return a.map(fn); }
);

// Addition
var plus = Lambda(2).case(
  function(a, b) {
    return typeof a == 'number' && typeof b == 'number';
  },
  function(a, b) {
    return a + b;
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
  function(fn, a) {
    return typeof fn == 'function' && a instanceof Maybe;
  },
  function(fn, a) {
    if (a.isSome()) {
      return Maybe.some(fn(a.value()));
    }
    else {
      return Maybe.none();
    }
  }
);


module.exports = {
  fmap: fmap,
  plus: plus,
  Maybe: Maybe
};
