import { createActor, SimulatedClock } from "xstate";
import { trafficLightMachine } from "./trafficLight.machine";

import { BehaviorSubject } from "rxjs";
import { Controlled } from "@/Dependencies/Environment/Environment";
import {
  NetworkAvailability,
  NetworkMonitorClient,
} from "@/Dependencies/NetworkMonitor/NetworkMonitor";

jest.setTimeout(1);

describe("TrafficLightMachine Tests", () => {
  let OriginalCurrent: typeof Controlled;
  beforeEach(() => {
    OriginalCurrent = { ...Controlled };
  });

  afterEach(() => {
    Object.entries(OriginalCurrent).forEach(([key, value]) => {
      // todo fix this any crap
      Controlled[key as keyof typeof Controlled] = value as any;
    });
  });

  describe("Pure Logic Tests - No Framework", () => {
    test("1. Basic Traffic Light Functionality", async () => {
      const clock = new SimulatedClock();
      const trafficLightActor = createActor(trafficLightMachine, { clock });
      trafficLightActor.start();
      expect(trafficLightActor.getSnapshot().context.reversed).toBe(false);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");

      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      clock.increment(5_000);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(5_000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");

      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
    });

    test("2. Basic Traffic Light Reverses Functionality with Internet Disconnected", async () => {
      Controlled.networkMonitorClient = NetworkMonitorClient.unsatisfied();
      const clock = new SimulatedClock();
      const trafficLightActor = createActor(trafficLightMachine, { clock });
      trafficLightActor.start();

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      expect(trafficLightActor.getSnapshot().context.reversed).toBe(true);
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
    });

    test("3. Traffic Light Responds to Internet Connectivity and Disconnectivity Events Mid Flow", async () => {
      const internetConnectivitySubject =
        // Setting this to unsatisfied starts causes the traffic light
        // to start in a reversed state, where it will transition to
        // red. We use a BehaviorSubject to allow ourselves control
        // over emitting events during the runtime of the test.
        new BehaviorSubject<NetworkAvailability>({ status: "unsatisfied" });
      Controlled.networkMonitorClient = NetworkMonitorClient.custom(
        internetConnectivitySubject,
      );
      const clock = new SimulatedClock();
      const trafficLightActor = createActor(trafficLightMachine, { clock });
      trafficLightActor.start();

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      expect(trafficLightActor.getSnapshot().context.reversed).toBe(true);
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      // Signal that we've regained internet connectivity
      internetConnectivitySubject.next({ status: "satisfied" });
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);

      expect(trafficLightActor.getSnapshot().value).toBe("green");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      clock.increment(2000);

      expect(trafficLightActor.getSnapshot().value).toBe("red");
      clock.increment(3500);
    });
  });
});
