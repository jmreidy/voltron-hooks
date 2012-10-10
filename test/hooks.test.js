/*
 * VoltronHooks.addBeforeHook(this, [methods,to,decorate])
 * VoltronHooks.addAfterHook(this, [methods,to,decorate])
 * VoltronHooks.addLifecycleHook(this, [methods, to, decorate])
 * define<x>Hooks(this, [methods, to, decorate], VoltronHooks.Serial/Parallel)
 * */
var VoltronHooks = require('../');
var Q = require('q');


describe('VoltronHooks', function () {
  var promiseHook = function () {
    return Q.when();
  };

  var errorPromiseHook = function () {
    return Q.when(new Error('Promise Error'));
  };

  var makeHost = function (cb) {
    var obj = {
      test: function () {
        return Q.when();
      }
    };
    sinon.spy(obj, 'test');
    return obj;
  };

  describe('#defineBeforeHook', function () {

    it('should throw an error if a host is not provided', function () {
      var call = function () {
        VoltronHooks.defineBeforeHook(null, 'update');
      };

      expect(call).to.throw('Host object must be provided');
    });


    describe('if one method name is provided', function () {
      it('should add a \'before<method>\' setter to the host', function () {
        var host = { test: function () {} };
        VoltronHooks.defineBeforeHook(host, 'test');

        expect(host).to.contain.key('beforeTest');
      });
    });

    describe('if an array of method names is provided', function () {
      it('should add a \'before<method>\' setter for each method to the host', function () {
        var host = {
          save: function () { return Q.when() },
          update: function () { return Q.when() }
        };
        VoltronHooks.defineBeforeHook(host, ['save','update']);

        expect(host).to.contain.keys('beforeSave','beforeUpdate');
      });
    });

    describe('if a hook is undefined', function () {

      it('should call the host function as normal', function (done) {
        var host = { test: function () { return Q.when(); } };
        VoltronHooks.defineBeforeHook(host, 'test');
        host._hooks.beforeTest = undefined;

        host.test()
          .then(function () {
            //Host function called
          }).nend(done);
      });
    });

  });

  describe('#defineAfterHook', function () {
    it('should throw an error if a host is not provided', function () {
      var call = function () {
        VoltronHooks.defineAfterHook(null, 'update');
      };

      expect(call).to.throw('Host object must be provided');
    });


    describe('if one method name is provided', function () {
      it('should add a \'after<method>\' setter to the host', function () {
        var host = { test: function () { return Q.when() } };
        VoltronHooks.defineAfterHook(host, 'test');

        expect(host).to.contain.key('afterTest');
      });
    });

    describe('if an array of method names is provided', function () {
      it('should add a \'after<method>\' setter for each method to the host', function () {
        var host = {
          save: function () { return Q.when() },
          update: function () { return Q.when() }
        };
        VoltronHooks.defineAfterHook(host, ['save','update']);

        expect(host).to.contain.keys('afterSave','afterUpdate');
      });
    });

  });

  describe('when a before hook is added, the host', function () {
    var host, spy;

    beforeEach(function () {
      host = {
        test: function() {
          return Q.when();
        }
      };
      spy = sinon.spy(host, 'test');
      VoltronHooks.defineBeforeHook(host, 'test');
    });

    it('should pass the host arguments to the hook', function (done) {
      var hook = sinon.spy(promiseHook);
      host.beforeTest = hook;

      host.test('a', 'b')
        .then(function () {
          expect(hook).to.have.been.calledWith('a', 'b');
        }).nend(done);
    });

    it('should invoke the hook with the same \'this\' as the host function', function (done) {
      var hook = sinon.spy(promiseHook);
      var Host = function () {};
      Host.prototype = {
        test: function() {
          return Q.when();
        }
      };
      spy = sinon.spy(Host.prototype, 'test');
      VoltronHooks.defineBeforeHook(Host.prototype, 'test');
      Host.prototype.beforeTest = hook;
      var h = new Host();

      h.test()
        .then(function () {
          expect(hook).to.have.been.calledOn(h);
        }).nend(done);
    });

    it('should call the hook before calling the host function', function (done) {
      var hook = sinon.spy(promiseHook);
      host.beforeTest = hook;

      host.test()
        .then(function () {
          expect(hook).to.have.been.calledOnce;
          expect(spy).to.have.been.calledOnce;
          expect(hook).to.have.been.calledBefore(spy);
        }).nend(done);
    });

    it('should throw an error that prevents executing the host function', function () {
      var hook = sinon.spy(errorPromiseHook);
      host.beforeTest = hook;

      host.test()
        .then(function () {
          done(new Error('Should be a failure'));
        }, function (err) {
          expect(hook).to.have.been.calledOnce;
          expect(spy).to.not.have.been.called;
          expect(err).to.be.an(Error);
          done();
        });

    });
  });

  describe('when an after hook is added, the host', function () {
    var host, spy;

    beforeEach(function () {
      host = {
        test: function() {
          return Q.when();
        }
      };
      spy = sinon.spy(host, 'test');
      VoltronHooks.defineAfterHook(host, 'test');
    });

    it('should pass the host arguments to the hook', function (done) {
      var hook = sinon.spy(promiseHook);
      host.afterTest = hook;

      host.test('a', 'b')
        .then(function () {
          expect(hook).to.have.been.calledWith('a', 'b');
        }).nend(done);
    });

    it('should invoke the hook with the same \'this\' as the host function', function (done) {
      var hook = sinon.spy(promiseHook);
      var Host = function () {};
      Host.prototype = {
        test: function() {
          return Q.when();
        }
      };
      spy = sinon.spy(Host.prototype, 'test');
      VoltronHooks.defineAfterHook(Host.prototype, 'test');
      Host.prototype.afterTest = hook;
      var h = new Host();

      h.test()
        .then(function () {
          expect(hook).to.have.been.calledOn(h);
        }).nend(done);
    });

    it('should call the hook after calling the host function', function (done) {
      var hook = sinon.spy(promiseHook);
      host.afterTest = hook;

      host.test()
        .then(function () {
          expect(hook).to.have.been.calledOnce;
          expect(spy).to.have.been.calledOnce;
          expect(spy).to.have.been.calledBefore(hook);
        }).nend(done);
    });

    it('should throw an error after executing the host function', function () {
      var hook = sinon.spy(errorPromiseHook);
      host.afterTest = hook;

      host.test()
        .then(function () {
          done(new Error('Should be a failure'));
        }, function (err) {
          expect(hook).to.have.been.calledOnce;
          expect(spy).to.have.been.calledOnce;
          expect(err).to.be.an(Error);
          done();
        });

    });
  });

});
