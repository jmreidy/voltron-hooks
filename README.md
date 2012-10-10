##NOT FOR PUBLIC USE YET!

[![Build Status](https://travis-ci.org/jmreidy/VoltronHooks.png)](https://travis-ci.org/jmreidy/VoltronHooks)

VoltronHooks allows you to add async, promise based lifecycle hooks (before/after calls)
to any method that returns a promise:

* beforeHooks are executed before a method call
* afterHooks are executed after a method call
* errors in before hooks prevent execution of the called method
* beforeHooks return the original method's promise; after hooks return a promise from the hook itself

VoltronHooks are used by VoltronModels and VoltronAdapters to add methods like beforeSave,
beforeUpdate, afterCreate, etc. But VoltronHooks can be applied to any object, independent
of whether other Voltron components are used.





