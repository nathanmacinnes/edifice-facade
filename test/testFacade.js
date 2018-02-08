"use strict";

const
  EventEmitter = require("events").EventEmitter,
  expect = require("expect.js"),
  injectr = require("injectr"),
  pretendr = require("pretendr");

describe("Facade", () => {
  let Facade,
    core,
    listener;
  beforeEach(() => {
    core = new EventEmitter();
    listener = pretendr();
    Facade = injectr("../lib/facade.js", {}, {
      console : console
    }).Facade;
  });
  describe("#emit", () => {
    beforeEach(() => {
      core.on("a", listener.mock);
    });
    it("is chainable", () => {
      const facade = new Facade(core);
      expect(facade.emit("a")).to.equal(facade);
    });
    it("passes events to the core", () => {
      const facade = new Facade(core);
      facade.emit("a");
      expect(listener.calls).to.have.length(1);
    });
    it("passes arguments to the core", () => {
      const
        args = [{}, [], "f"],
        facade = new Facade(core);
      facade.emit("a", args[0], args[1], args[2]);
      expect(listener.calls[0].args).to.have.property(0, args[0])
        .and.to.have.property(1, args[1])
        .and.to.have.property(2, args[2]);
    });
    it("throws an error when events aren't in the emit array", () => {
      const facade = new Facade(core, {
        emit : []
      });
      expect(() => {
        facade.emit("a");
      }).to.throwError(/Event 'a' not permitted by this facade./);
    });
    it("doesn't throw an error when events are in the emit array", () => {
      const facade = new Facade(core, {
        emit : ["a"]
      });
      expect(() => {
        facade.emit("a");
      }).not.to.throwError();
    });
  });
  describe("#on", () => {
    it("is chainable", () => {
      const facade = new Facade(core);
      expect(facade.on("a", () => {})).to.equal(facade);
    });
    it("listens for events on the core", () => {
      const facade = new Facade(core);
      facade.on("b", listener.mock);
      core.emit("b");
      core.emit("b");
      expect(listener.calls).to.have.length(2);
    });
    it("does not listen for events created by own emit", () => {
      const facade = new Facade(core);
      facade.on("c", listener.mock);
      facade.emit("c");
      expect(listener.calls).to.have.length(0);
    });
    it("uses multiple listeners once each", () => {
      const
        facade = new Facade(core),
        listener2 = pretendr();
      facade.on("a", listener.mock);
      facade.on("a", listener2.mock);
      core.emit("a");
      expect(listener.calls).to.have.length(1);
      expect(listener2.calls).to.have.length(1);
    });
    it("has arguments passed from the core", () => {
      const arg = {},
        facade = new Facade(core);
      facade.on("c", listener.mock);
      core.emit("c", arg);
      expect(listener.calls[0].args[0]).to.equal(arg);
    });
    it("throws an error when events aren't in the 'on' array", () => {
      const facade = new Facade(core, {
        on : []
      });
      expect(() => {
        facade.on("a", () => {});
      }).to.throwError(/Event 'a' not permitted by this facade./);
    });
    it("doesn't throw an error when events are in the 'on' array", () => {
      const facade = new Facade(core, {
        on : ["a"]
      });
      expect(() => {
        facade.on("a", () => {});
      }).not.to.throwError();
    });
  });
  describe("#once", () => {
    it("is chainable", () => {
      const facade = new Facade(core);
      expect(facade.once("a", () => {})).to.equal(facade);
    });
    it("listens once for events on the core", () => {
      const facade = new Facade(core);
      facade.once("b", listener.mock);
      core.emit("b");
      core.emit("b");
      expect(listener.calls).to.have.length(1);
    });
    it("does not listen for events created by own emit", () => {
      const facade = new Facade(core);
      facade.once("c", listener.mock);
      facade.emit("c");
      expect(listener.calls).to.have.length(0);
    });
    it("has arguments passed from the core", () => {
      const arg = {},
        facade = new Facade(core);
      facade.once("c", listener.mock);
      core.emit("c", arg);
      expect(listener.calls[0].args[0]).to.equal(arg);
    });
    it("continues listening after own emit", () => {
      const facade = new Facade(core);
      facade.once("c", listener.mock);
      facade.emit("c");
      core.emit("c");
      expect(listener.calls).to.have.length(1);
    });
    it("throws an error when events aren't in the 'on' array", () => {
      const facade = new Facade(core, {
        on : []
      });
      expect(() => {
        facade.once("a", () => {});
      }).to.throwError(/Event 'a' not permitted by this facade./);
    });
    it("doesn't throw an error when events are in the 'on' array", () => {
      const facade = new Facade(core, {
        on : ["a"]
      });
      expect(() => {
        facade.once("a", () => {});
      }).not.to.throwError();
    });
  });
  describe("#removeListener", () => {
    it("is chainable", () => {
      const facade = new Facade(core);
      expect(facade.removeListener("a", () => {})).to.equal(facade);
    });
    it("removes the specified listener", () => {
      const facade = new Facade(core);
      facade.on("b", listener.mock);
      facade.removeListener("b", listener.mock);
      core.emit("b");
      expect(listener.calls).to.have.length(0);
    });
    it("leaves other listeners alone", () => {
      const
        facade = new Facade(core),
        listener2 = pretendr(),
        listener3 = pretendr();
      facade
        .on("a", listener.mock)
        .on("b", listener2.mock)
        .on("a", listener3.mock)
       .removeListener("a", listener.mock);
      core.emit("a");
      core.emit("b");
      expect(listener.calls).to.have.length(0);
      expect(listener2.calls).to.have.length(1);
      expect(listener3.calls).to.have.length(1);
    });
  });
  describe("pair of facades", () => {
    const facades = [];
    beforeEach(() => {
      let i = 2;
      facades.splice(0);
      while (i--) {
        facades.push(new Facade(core));
      }
    });
    it("ping-pongs events", () => {
      facades[0].on("a", () => {
        facades[0].emit("b");
      });
      facades[1].on("b", listener.mock);
      facades[1].emit("a");
      expect(listener.calls).to.have.length(1);
    });
    it("ping-pongs events with the same name", () => {
      facades[0].on("a", () => {
        facades[0].emit("a");
      });
      facades[1].on("a", listener.mock);
      facades[1].emit("a");
      expect(listener.calls).to.have.length(1);
    });
    it("copies the arguments exactly between them", () => {
      const argsSent = [{}, {}, {}];
      let argsReceived;
      facades[0].on("a", function() {
        argsReceived = arguments;
      });
      facades[1].emit.apply(facades[1], ["a"].concat(argsSent));
      expect(argsReceived)
        .to.have.length(3)
        .and.to.have.property(0, argsSent[0])
        .and.to.have.property(1, argsSent[1])
        .and.to.have.property(2, argsSent[2]);
    });
  });
});
