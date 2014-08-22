// Constructor for auto-curried pattern matching functions
// for adhoc polymorphism.
//
// Lambda(<number of arguments>);
//
// Cases are added with extended with:
// .case(predicate, expression)
// .default(expression)
//
// Lambdas are mutable, adding a case to a lambda modifies the
// lambda. Use `.clone` to copy a lambda so that it can be extended
// without modifying anything else.
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  }
  else {
    root.Lambda = factory();
  }
})(this, function() {
  'use strict';

  var Lambda = function(numArgs, cases, defaultCase) {
    var guard, fn, _cases, _defaultCase;

    _cases       = cases ? cases.slice(0) : [];
    _defaultCase = defaultCase || null;

    fn = function() {
      var i, test, result;

      for (i = 0; i < _cases.length; i++) {
        test = _cases[i];

        if (test.predicate.apply(this, arguments) === true) {
          return test.expression.apply(this, arguments);
        }
      }

      if (_defaultCase !== null) {
        return _defaultCase.apply(this, arguments);
      }
      else {
        throw new Error('No matching case found for: ' + Array.prototype.slice.call(arguments));
      }
    };

    guard = function() {
      var args = Array.prototype.slice.call(arguments);

      if (args.length < numArgs) {
        return function innerGuard() {
          var allArgs = args.concat(Array.prototype.slice.call(arguments));
          return guard.apply(this, allArgs);
        };
      }
      else {
        return fn.apply(this, args);
      }
    };

    guard.case = function(predicate, expression) {
      _cases.push({ predicate: predicate, expression: expression });
      return guard;
    };

    guard.default = function(expression) {
      _defaultCase = expression;
      return guard;
    };

    guard.clone = function() {
      return Lambda(numArgs, _cases, _defaultCase);
    };

    guard.numArgs = numArgs;

    return guard;
  };

  return Lambda;
});

