edifice-facade
==============

Create facades to separate modules in your application

Facades rely on a core which can be as simple as an EventEmitter. They separate
modules from each other, so that the modules communicate with each other using
events.

````
var EventEmitter = require("events").EventEmitter,
    Facade = require("edifice-facade");

var core = new EventEmitter();

var fileInterfaceFacade = new Facade(core,
    ['fileDataRead', 'fileWritten'], // permitted actions
    ['newInputData'] // permitted listeners
);
var userInterfaceFacade = new Facade(core,
    ['newInputData'],
    ['fileDataRead', 'fileWritten']
);
````

Now pass these facades to your `fileInterface` and `userInterface`, so they
don't need to have each other or the core itself in scope.
