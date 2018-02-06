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
    core.on("a", listener.mock);
    Facade = injectr("../lib/facade.js").Facade;
  });
  describe("#emit", () => {
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
      }).to.throwError(/Event 'a' not in 'emit' array/);
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
    it("listens for events on the core", () => {
      const facade = new Facade(core);
      facade.on("b", listener.mock);
      core.emit("b");
      expect(listener.calls).to.have.length(1);
    });
    it("does not listen for events created by own emit", () => {
      const facade = new Facade(core);
      facade.on("c", listener.mock);
      facade.emit("c");
      expect(listener.calls).to.have.length(0);
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
        facade.on("a");
      }).to.throwError(/Event 'a' not in 'on' array/);
    });
    it("doesn't throw an error when events are in the 'on' array", () => {
      const facade = new Facade(core, {
        on : ["a"]
      });
      expect(() => {
        facade.on("a");
      }).not.to.throwError();
    });
  });
  describe("pair of facades", () => {
    it("will pass all arguments between them", () => {
      const
        args = [{}, [], "3"],
        facades = [new Facade(core), new Facade(core)];
      facades[0].on("a", listener.mock);
      facades[1].emit("a", args[0], args[1], args[2]);
      expect(listener.calls[0].args)
        .to.have.length(3)
        .and.to.have.property(0, args[0])
        .and.to.have.property(1, args[1])
        .and.to.have.property(2, args[2]);
    });
  });
});
