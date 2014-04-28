var util = require("util"),
    EventEmitter = require("events").EventEmitter;

util.inherits(Facade, EventEmitter);
module.exports.Facade = Facade;

function Facade(core, actions, listeners) {
    var thisFacade = this;

    actions = actions || [];
    listeners = listeners || [];

    pipeEvents(actions, this, core);
    pipeEvents(listeners, core, this).forEach(function (fn) {
        // so that core can find events by facade
        fn.facade = thisFacade;
    });
}

function pipeEvents(eventList, origin, destination) {
    return eventList.map(function (event) {
        origin.on(event, handler);
        return handler;

        function handler() {
            var backup = origin.listeners(event);

            // prevent infinite recursion
            origin.removeAllListeners(event);

            destination.emit.apply(destination,
                Array.prototype.concat.apply([event], arguments));

            // restore backup
            backup.forEach(function (listener) {
                origin.on(event, listener);
            });
        }
    });
}