edifice-facade
==============

Create facades to separate modules in your application.

Facades rely on a core which can be as simple as an EventEmitter. They separate
modules from each other, and the modules communicate using events. It also
enhances internal application security, ensuring nothing has more in scope than
it needs.

````js
var EventEmitter = require("events").EventEmitter,
    Facade = require("edifice-facade");

var core = new EventEmitter();

var timerFacade = new Facade(core);
var userInterfaceFacade = new Facade(core);
````

Now pass these facades to your `timer` and `userInterface`, so they
don't need to have each other or the core itself in scope.

````js
function userInterface(facade) {
  timerUserEntry.onchange = function () {
    facade.emit('timerValueChange', this.value);
  };
  facade.on('timerValueChange', function (timerVal) {
    timerUserEntry.value = timerVal;
  });
}
````
Facades don't respond to their own events, only events from other facades,
allowing the same data to be updated and read my multiple sources, while
preventing loops or awkward if statements.

Module permissions
------------------
Facades can be restricted in what events they can send and receive.

````js
var fileSystemFacade = new Facade(core, {
  emit : ['writeSuccess', 'fileContents'],
  on : ['save', 'read']
});

// This line will throw an error, as fileSystemFacade doesn't have receive (on)
// permissions on userInteraction.
fileSystemFacade.on('userInteraction', function () { ... });

// This line will also throw, as fileSystemFacade doesn't have send (emit)
// permissions on save. It should be doing the saving!
fileSystemFacade.emit('save', data);
````

Why the name edifice-facade?
----------------------------
I originally planned on making a module called edifice as the core, then
realised the core could just be a plain old EventEmitter. So ediface is no more.

License
-------
MIT.
