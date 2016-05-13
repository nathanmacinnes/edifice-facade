var clone = require("clone"),
  EventEmitter = require("events").EventEmitter,
  expect = require("expect.js"),
  injectr = require("injectr"),
  pretendr = require("pretendr");

describe("Facade", function () {
  var Facade,
    core,
    coreListener;
  beforeEach(function () {
    core = new EventEmitter();
    coreListener = pretendr(function () {});
    core.on("a", coreListener.mock);
  });
  describe("#emit", function () {
    beforeEach(function () {
      Facade = injectr("../lib/facade.js").Facade;
    });
    it("passes events to the core", function () {
      var facade = new Facade(core);
      facade.emit("a");
      expect(coreListener.calls).to.have.length(1);
    });
    it("passes arguments to the core", function () {
      var args = [{}, [], 'f'],
        facade = new Facade(core);
      facade.emit("a", args[0], args[1], args[2]);
      expect(coreListener.calls[0].args).to.have.property(0, args[0])
        .and.to.have.property(1, args[1])
        .and.to.have.property(2, args[2]);
    });
    it("throws an error when events aren't in the emit array", function () {
      var facade = new Facade(core, {
        emit : []
      });
      expect(function () {
        facade.emit('a');
      }).to.throwError(/Event 'a' not in 'emit' array/);
    });
    it("doesn't throw an error when events are in the emit array", function () {
      var facade = new Facade(core, {
        emit : ['a']
      });
      expect(function () {
        facade.emit('a');
      }).not.to.throwError();
    });
  });
  describe("#on", function () {
    var listener;
    beforeEach(function () {
      Facade = injectr("../lib/facade.js").Facade;
      listener = pretendr(function () {});
    });
    it("listens for events on the core", function () {
      var facade = new Facade(core);
      facade.on('b', listener.mock);
      core.emit('b');
      expect(listener.calls).to.have.length(1);
    });
    it("does not listen for events created by own emit", function () {
      var facade = new Facade(core);
      facade.on('c', listener.mock);
      facade.emit('c');
      expect(listener.calls).to.have.length(0);
    });
    it("has arguments passed from the core", function () {
      var arg = {},
        facade = new Facade(core);
      facade.on('c', listener.mock);
      core.emit('c', arg);
      expect(listener.calls[0].args[0]).to.equal(arg);
    });
    it("throws an error when events aren't in the 'on' array", function () {
      var facade = new Facade(core, {
        on : []
      });
      expect(function () {
        facade.on('a');
      }).to.throwError(/Event 'a' not in 'on' array/);
    });
    it("doesn't throw an error when events are in the 'on' array", function () {
      var facade = new Facade(core, {
        on : ['a']
      });
      expect(function () {
        facade.on('a');
      }).not.to.throwError();
    });
  });
  describe("pair of facades", function () {
    var facades,
      listener;
    beforeEach(function () {
      Facade = injectr("../lib/facade.js").Facade;
      listener = pretendr(function () {});
      facades = [new Facade(core), new Facade(core)];
    });
    it("will pass arguments exactly between them", function () {
      var args = [{}, [], '3'];
      facades[0].on('a', listener.mock);
      facades[1].emit('a', args[0], args[1], args[2]);
      expect(listener.calls[0].args)
        .to.have.length(args.length)
        .and.to.have.property(0, args[0])
        .and.to.have.property(1, args[1])
        .and.to.have.property(2, args[2]);
    });
  });
});
