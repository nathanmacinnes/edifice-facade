var clone = require("clone"),
    EventEmitter = require("events").EventEmitter,
    expect = require("expect.js"),
    injectr = require("injectr"),
    pretendr = require("pretendr");

describe("Facade", function () {
    var Facade,
        mockCore,
        core,
        coreListener;
    beforeEach(function () {
        core = new EventEmitter();
        coreListener = pretendr(function () {});
        core.on("a", coreListener.mock);
    });
    it("inherits EventEmitter", function () {
        var requires;
        requires = pretendr({
            util : {
                inherits : function () {}
            },
            events : {
                EventEmitter : function () {}
            }
        });
        Facade = injectr("../lib/facade.js", requires.mock).Facade;
        expect(requires.util.inherits.calls).to.have.length(1);
        expect(requires.util.inherits.calls[0].args)
            .to.have.property(0, Facade)
            .and.to.have.property(1, requires.events.EventEmitter.mock);
    });
    it("makes the array properties optional", function () {
        Facade = injectr("../lib/facade.js").Facade;
        expect(function () {
            new Facade(new EventEmitter());
        }).to.not.throwException();
    });

    describe("#emit", function () {
        beforeEach(function () {
            Facade = injectr("../lib/facade.js").Facade;
        });
        it("passes emits to the core for listed actions", function () {
            var eventData = {},
                facade = new Facade(core, ["a"], []);
            facade.emit("a", eventData);
            expect(coreListener.calls).to.have.length(1);
            expect(coreListener.calls[0].args)
                .to.have.property(0, eventData);
        });
        it("passes emits to the core with no data", function () {
            var facade = new Facade(core, ["a"], []);
            facade.emit("a");
            expect(coreListener.calls).to.have.length(1);
            expect(coreListener.calls[0].args).to.have.length(0);
        });
        it("doesn't emit multiple times", function () {
            var facade = new Facade(core, ["a"], ["a"]),
                listener = pretendr(function () {});
            facade.on("a", listener.mock);
            facade.emit("a", {});
            expect(coreListener.calls).to.have.length(1);
            expect(listener.calls).to.have.length(1);
        });
        it("doesn't disrupt the listeners on itself", function () {
            var e,
                facade = new Facade(core, ["a"], ["a", "b"]);
            ["a", "a", "b"].forEach(function (e) {
                facade.on(e, function () {});
            });
            e = clone(facade._events);
            facade.emit("a");
            expect(facade._events).to.eql(e);
        });
        it("doesn't pass emits of non-listed actions", function () {
            var facade = new Facade(core, ["c"], []);
            facade.emit("a", {});
            expect(coreListener.calls).to.have.length(0);
        });
        it("passes multiple arguments to the core", function () {
            var facade = new Facade(core, ["a"], []);
            facade.emit("a", "b", "c");
            expect(coreListener.calls).to.have.length(1);
            expect(coreListener.calls[0].args)
                .to.have.property(0, "b")
                .and.to.have.property(1, "c");
        });
    });

    describe("#on", function () {
        beforeEach(function () {
            Facade = injectr("../lib/facade.js").Facade;
            mockCore = pretendr({
                on : function () {},
                emit : function () {}
            });
        });
        it("passes handlers to the core for listed listeners", function () {
            var fn = pretendr(function () {}),
                facade = new Facade(core, [], ["b"]);
            facade.on("b", fn.mock);
            expect(core.listeners("b")).to.have.length(1);
            core.emit("b", "foo");
            expect(fn.calls).to.have.length(1);
            expect(fn.calls[0].args).to.have.property(0, "foo");
        });
        it("doesn't pass handlers for non-listed listeners", function () {
            var facade = new Facade(core, [], ["b"]),
                listener = pretendr(function () {});
            facade.on("c", listener.mock);
            core.emit("c");
            expect(listener.calls).to.have.length(0);
        });
        it("adds the facade as a property of the handler", function () {
            var facade = new Facade(core, [], ["b"]);
            facade.on("b", function () {});
            expect(core.listeners("b")[0])
                .to.have.property("facade", facade);
        });
    });
});