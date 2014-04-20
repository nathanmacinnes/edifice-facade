var util = require("util"),
    EventEmitter = require("events").EventEmitter;

util.inherits(Facade, EventEmitter);

module.exports = {
    Facade : Facade
};

function Facade(core, actions, listeners) {
    var lastEventData = {},
        thisFacade = this;

    actions = actions || [];
    listeners = listeners || [];

    // the user calls emit on the facade
    // so call emit on the core
    pipe(actions, this, core);

    // emit is called on the core (by another facade)
    // so call emit on this
    pipe(listeners, core, this).forEach(function (fn) {
        // add the property so that the core is able to list events by facade,
        // mainly so they can be hunted down and killed if necessary
        fn.facade = thisFacade;
    });

    function pipe(eventList, origin, destination, errorFn) {
        var fns = [];
        eventList.forEach(function (event) {
            fns.push(handler);
            origin.on(event, handler);

            function handler(data) {
                // the following check prevents infinite recursion
                if (data !== lastEventData[event]) {
                    lastEventData[event] = data;
                    destination.emit(event, data);
                }
            }
        });
        return fns;
    }
}