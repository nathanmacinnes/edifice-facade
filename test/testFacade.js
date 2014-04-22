var expect = require("expect.js"),
    injectr = require("injectr"),
    pretendr = require("pretendr");

describe("Facade", function () {
    var Facade,
        mockCore;
    it("should inherit from EventEmitter", function () {
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
        expect(new Facade({})).to.be.a(Facade);
    });

    describe("#emit", function () {
        beforeEach(function () {
            Facade = injectr("../lib/facade.js").Facade;
            mockCore = pretendr({
                on : function () {},
                emit : function () {}
            });
        });
        it("passes emits to the core for listed actions", function () {
            var eventData = {},
                facade = new Facade(mockCore.mock, ['a'], []);
            facade.emit('a', eventData);
            expect(mockCore.emit.calls).to.have.length(1);
            expect(mockCore.emit.calls[0].args)
                .to.have.property(0, 'a')
                .and.to.have.property(1, eventData);
        });
        it("doesn't pass emits of non-listed actions", function () {
            var facade = new Facade(mockCore.mock, ['a'], []);
            facade.emit('c', {});
            expect(mockCore.emit.calls).to.have.length(0);
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
                facade = new Facade(mockCore.mock, [], ['a']);
            facade.on('a', fn.mock);
            expect(mockCore.on.calls).to.have.length(1);
            expect(mockCore.on.calls[0].args)
                .to.have.property(0, 'a');
            mockCore.on.calls[0].args[1]('foo');
            expect(fn.calls).to.have.length(1);
            expect(fn.calls[0].args).to.have.property(0, 'foo');
        });
        it("doesn't pass handlers for non-listed listeners", function () {
            var facade = new Facade(mockCore.mock, [], ['a', 'b']);
            facade.on('c', function () {});
            expect(mockCore.on.calls).to.have.length(2);
            expect(mockCore.on.calls[0].args).to.have.property(0, 'a');
            expect(mockCore.on.calls[1].args).to.have.property(0, 'b');
        });
        it("adds the facade as a property of the handler", function () {
            var facade = new Facade(mockCore.mock, [], ['a']);
            facade.on('a', function () {});
            expect(mockCore.on.calls[0].args[1])
                .to.have.property('facade', facade);
        });
    });
});