var
  EventEmitter = require("events").EventEmitter;

module.exports = Facade;
Facade.Facade = Facade;

require("util").inherits(Facade, EventEmitter);

function Facade(core, permissions) {
  var
    addedListeners = [],
    facade = this,
    suspended = false;
  permissions = permissions || {};

  this.on("newListener", function (event) {
    checkPermissible(event, "on");

    // Don't add this listener to core more than once.
    if (addedListeners.indexOf(event) !== -1) {
      return;
    }
    addedListeners.push(event);

    core.on(event, function () {

      // The event will be suspended if our overwritten emit method called it.
      // This stops listeners firing for this facade's own events. It relies on
      // the core being synchronous (which EventEmitters always are).
      if (suspended) {
        return;
      }
      nativeEmit.apply(null, [event].concat(Array.from(arguments)));
    });
  });

  this.emit = function (event) {

    // This is called internally by node's events module.
    if (event === "newListener") {
      return nativeEmit.apply(null, arguments);
    }

    checkPermissible(event, "emit");
    suspended = true;
    core.emit.apply(core, arguments);
    suspended = false;
    return this;
  };

  function checkPermissible(eventName, type) {
    if (permissions[type] && permissions[type].indexOf(eventName) === -1) {
      throw new Error("Event '" + eventName + "' not in '" + type + "' array");
    }
  }
  function nativeEmit() {
    return EventEmitter.prototype.emit.apply(facade, arguments);
  }
}
