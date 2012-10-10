var Q = require('q');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

var createHooksArrayOn = function (host) {
  if (!host) {
    throw new Error('Host object must be provided');
  }

  if(!host._hooks) {
    Object.defineProperty(host, '_hooks', {
      value: {}
    });
  }
  return host;
};

var checkForSingleMethod = function (methods) {
  if (typeof methods === 'string') {
    return [methods];
  }
  else {
    return methods;
  }
};

var defineHook = function (host, method, precedent) {
    var stage = '' + precedent + method.capitalize();

    Object.defineProperty(host, stage, {
      set: function (fn) {
        host._hooks[stage] = fn;
      }, enumerable: true
    });

    var _originalMethod = host[method];

    host[method] = function () {
      var hook = host._hooks[stage];
      var args = Array.prototype.slice.call(arguments);
      var promise;
      if (precedent.match(/before/)) {
        promise = hook.apply(host, args);

        if (promise && promise.then) {
          promise.then(function () {
            return _originalMethod.apply(host, args);
          }, function(err) {
            throw err;
          });
        }
      }
      else {
        promise = _originalMethod.apply(host, args);
        if (promise && promise.then) {
          promise.then(function () {
            return hook.apply(host, args);
          }, function(err) {
            throw err;
          });
        }
      }
      return promise;
    };
};

module.exports = {

  defineBeforeHook: function (host, methods) {
    host = createHooksArrayOn(host);
    methods = checkForSingleMethod(methods);

    methods.forEach(function (method) {
      defineHook(host, method, 'before');
    });

    return;
  },

  defineAfterHook: function (host, methods) {
    host = createHooksArrayOn(host);
    methods = checkForSingleMethod(methods);

    methods.forEach(function (method) {
      defineHook(host, method, 'after');
    });

    return;
  }

};
