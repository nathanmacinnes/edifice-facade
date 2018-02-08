edifice-facade
==============
![Travis Build Status](https://api.travis-ci.org/nathanmacinnes/edifice-facade.svg?branch=master)

We can connect different parts of an application with an EventEmitter. Let's
call this the `core`.

````js
function initUserInterface(core) {
  form.onsubmit((data) => {
    core.emit("contentupdate", data);
  });
}
````

If a `contentupdate` can also come from a database update, we want to listen for
these in the user interface module. This can cause an annoying event loop.

````js
function initUserInterface(core) {
  form.onsubmit((data) => {
    core.emit("contentupdate", data);
  }
  core.on("contentupdate", (data) => {
    form.update(data);
  });
}
````

Facades create a separate "view" of the core for each module. Facades don't fire
their own events, only those of other facades.

````js
const EventEmitter = require("events").EventEmitter;
const Facade = require("edifice-facade");

const core = new EventEmitter();
const dbFacade = new Facade(core);
const uiFacade = new Facade(core);
````

But we don't want the database module firing an `alertuser` event. We create
internal application security with permissions.

````js
const dbFacade = new Facade(core, {
  on : ["contentupdate", "contentexpiry", "userloginattempt"],
  emit : ["contentupdate", "userloginsuccess", "userloginfailure"]
});
````

Now all that's left is to pass your facades to each of your modules.
````js
require("./userInterface").init(uiFacade);
````

Top tips:
* Make sure that each module has only the bits in scope that it needs. Your
  central app module should intialise the core and facades, and then pass the
  facades to the other modules.
* Each event should have a documented arguments list.

Why the name edifice-facade?
----------------------------
I originally planned on making a module called edifice as the core, then
realised the core could just be a plain old EventEmitter. So ediface is no more.
Long live facade.

License
-------
MIT.
