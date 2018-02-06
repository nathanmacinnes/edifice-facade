module.exports = Facade;
Facade.Facade = Facade;

function Facade(core, permissions) {
  var suspended = false;
  permissions = permissions || {};

  this.emit = function (eventName) {
    checkPermissible(eventName, "emit");

    // Stop facade from firing own events. This relies on core being sync.
    // Node's EventEmitters always are.
    suspended = true;

    core.emit.apply(core, arguments);
    suspended = false;
  };
  this.on = function (eventName, cb) {
    checkPermissible(eventName, "on");
    core.on(eventName, function () {
      if (suspended) {
        return;
      }
      cb.apply(null, arguments);
    });
  };
  function checkPermissible(eventName, type) {
    if (permissions[type] && permissions[type].indexOf(eventName) === -1) {
      throw new Error("Event '" + eventName + "' not in '" + type + "' array");
    }
  }
}
