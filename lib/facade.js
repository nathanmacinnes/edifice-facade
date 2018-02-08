var
  EventEmitter = require("events").EventEmitter,
  util = require("util");

module.exports = Facade;
Facade.Facade = Facade;

util.inherits(Facade, EventEmitter);

function Facade(core, permissions) {
  var
    addedListeners = [],
    facade = this,
    facadeID = new FacadeIdentifier();
  permissions = permissions || {};

  this.on("newListener", function (event) {
    checkPermissible(event, "on");

    // Don't add this listener to core more than once.
    if (addedListeners.indexOf(event) !== -1) {
      return;
    }
    addedListeners.push(event);

    core.on(event, function () {
      var args = Array.from(arguments);

      // Check if the event was fired by this facade
      if (args[args.length - 1] === facadeID) {
        return;
      }

      // Remove the extra argument if the event was fired by another facade
      if (args[args.length - 1] instanceof FacadeIdentifier) {
        args.pop();
      }

      nativeEmit.apply(null, [event].concat(args));
    });
  });

  this.emit = function (event) {
    var args = Array.from(arguments);

    // This is called internally by node's events module.
    if (event === "newListener") {
      return nativeEmit.apply(null, arguments);
    }

    checkPermissible(event, "emit");

    // Add an extra argument so that this facade can identify its own events.
    core.emit.apply(core, args.concat(facadeID));

    return this;
  };

  function checkPermissible(eventName, type) {
    if (permissions[type] && permissions[type].indexOf(eventName) === -1) {
      throw new Error("Event '" + eventName + "' not permitted by this facade."
        );
    }
  }
  function nativeEmit() {
    return EventEmitter.prototype.emit.apply(facade, arguments);
  }
}
function FacadeIdentifier() {}
