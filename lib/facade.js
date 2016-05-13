module.exports = Facade;
Facade.Facade = Facade;

function Facade(core, permissions) {

  // Pass this to all events so that this facade knows its own events.
  var identifier = new FacadeIdentifier();

  permissions = permissions || {};

  this.emit = function (eventName) {
    if (permissions.emit && permissions.emit.indexOf(eventName) === -1) {
      throw new Error("Event '" + eventName + "' not in 'emit' array");
    }
    core.emit.apply(
      core, Array.from(arguments).concat(identifier));
  };
  this.on = function (eventName, cb) {
    if (permissions.on && permissions.on.indexOf(eventName) === -1) {
      throw new Error("Event '" + eventName + "' not in 'on' array");
    }
    core.on(eventName, function () {
      var idFlag;
      if (arguments[arguments.length - 1] === identifier) {
        return;
      }
      if (arguments[arguments.length - 1] instanceof FacadeIdentifier) {
        idFlag = -1;
      }
      cb.apply(null, Array.from(arguments).slice(0, idFlag));
    });
  };
}

// Make all identifiers instances of the same class so that they can be
// identified and stripped out of events.
function FacadeIdentifier () {}
