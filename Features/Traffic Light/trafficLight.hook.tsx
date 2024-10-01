import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useActor } from "@xstate/react";
import { trafficLightMachine } from "@/Features/Traffic Light/trafficLight.machine";
import { Controlled } from "@/Dependencies/Environment/Environment";
import { NetworkMonitorClient } from "@/Dependencies/NetworkMonitor/NetworkMonitor";

/**
 * **Traffic Light Hook Implementations**
 *
 * *Stately AI:*
 * [Traffic Light Machine
 * Editor](https://stately.ai/registry/editor/0707a7a3-4697-4e32-b265-58ccb15af006?machineId=d6a0447f-bf94-47c1-99de-c878d4b4d2dc)
 *
 * *Figma:*
 * [Traffic Light
 * Design](https://www.figma.com/design/MdVfdGuvt83kYDgeVyhVje/Untitled?node-id=0-1&node-type=canvas&t=m38p7fa8NeKGeQWp-11)
 *
 * *GitHub:*
 * [Mobile Architecture Patterns
 * Demo](https://github.com/ephemeraHQ/mobile-architecture-patterns-demo)
 *
 * ---
 *
 * **Overview**
 *
 * Imagine you're orchestrating a traffic light system. At first glance, it
 * seems straightforward: green to yellow to red, then back to green. But what
 * happens when external factors, like internet connectivity, need to influence
 * this sequence? The complexity can escalate quickly.
 *
 * Let's explore two implementations:
 *
 * 1. **Pure React (`useTrafficLight__react__uncontrolledDependencies`):**
 *    Manually managing state transitions and dependencies.
 * 2. **XState with Controlled Dependencies
 * (`useTrafficLight__xstate__controlledDependencies`):** Utilizing a state
 * machine and injecting dependencies for cleaner control.
 *
 * **Comparing the Approaches**
 *
 * *Pure React Implementation:*
 * - **Cognitive Load:** We have to manually handle timers, state transitions,
 * and side effects. Keeping track of all these moving parts increases the
 * mental burden.
 * - **Dependency Management:** Incorporating real or simulated internet
 * connectivity requires additional state and effect hooks, intertwining our
 * core logic with dependency management.
 * - **Testability:** Testing requires simulating time and state changes, which
 * can be cumbersome.
 *
 * *State Machine with XState:*
 * - **Cognitive Load:** The state machine explicitly defines states and
 * transitions, making the logic more transparent and easier to reason about.
 * - **Dependency Injection:** We can inject different `NetworkMonitorClient`
 * implementations to simulate various conditions without altering the core
 * logic.
 * - **Testability:** The predictable nature of state machines simplifies
 * testing. We can simulate time and events without dealing with the
 * intricacies of state management.
 *
 * **Controlling Dependencies Simplified**
 *
 * In the XState implementation, changing the network behavior is as simple as
 * swapping out the `NetworkMonitorClient`. We don't need to weave through
 * layers of logic to simulate different scenarios. This decoupling enhances
 * developer ergonomics by reducing the amount of context we need to hold in
 * our heads.
 *
 * **Philosophical Standpoint**
 *
 * As developers, our goal is to build systems that are not just functional but
 * also maintainable and understandable. By embracing state machines and
 * controlled dependencies, we create codebases that are less prone to bugs,
 * easier to test, and more pleasant to work with. It's like having a
 * well-organized toolbox where you can quickly find the right tool without
 * rummaging through a pile of clutter.
 *
 * While both approaches can achieve the desired functionality, using a state
 * machine with controlled dependencies offers significant advantages in
 * reducing cognitive load, improving testability, enhancing overall code
 * quality, and providing a consistent manner in which to develop features.
 */

export const useTrafficLight__react__uncontrolledDependencies = () => {
  // State variables for light color and internet connectivity
  const [lightColor, setLightColor] = useState<"green" | "yellow" | "red">(
    "green",
  );
  const [reversed, setReversed] = useState(false);
  const [internetConnected, setInternetConnected] = useState(true);
  const [isUsingRealConnectivity, setIsUsingRealConnectivity] = useState(false);

  // Duration constants for each light color
  const greenDelayMs = 2000;
  const yellowDelayMs = 2000;
  const redDelayMs = 3500;

  // Function to toggle internet connectivity (simulate)
  const simulateToggleInternetConnectivity = () => {
    if (!isUsingRealConnectivity) {
      setInternetConnected((prev) => !prev);
    }
  };

  // Update 'reversed' state when 'internetConnected' changes
  useEffect(() => {
    setReversed(!internetConnected);
  }, [internetConnected]);

  // Effect to handle real internet connectivity if enabled
  useEffect(() => {
    if (!isUsingRealConnectivity) return;

    let isMounted = true;

    // Fetch initial network state
    NetInfo.fetch().then((state) => {
      if (isMounted) {
        setInternetConnected(!!state.isConnected);
      }
    });

    // Subscribe to network state updates
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (isMounted) {
        setInternetConnected(!!state.isConnected);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeNetInfo();
    };
  }, [isUsingRealConnectivity]);

  // Effect to handle state transitions
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const transition = () => {
      if (lightColor === "green") {
        setLightColor(reversed ? "red" : "yellow");
      } else if (lightColor === "yellow") {
        setLightColor(reversed ? "green" : "red");
      } else if (lightColor === "red") {
        setLightColor(reversed ? "yellow" : "green");
      }
    };

    const delay =
      lightColor === "green"
        ? greenDelayMs
        : lightColor === "yellow"
          ? yellowDelayMs
          : redDelayMs;

    timeoutId = setTimeout(transition, delay);

    return () => clearTimeout(timeoutId);
  }, [lightColor, reversed]);

  const buttonTitle = reversed
    ? "Simulate Internet Connected"
    : "Simulate Internet Disconnected";

  const setUseRealConnectivity = () => {
    setIsUsingRealConnectivity(!isUsingRealConnectivity);
  };

  return {
    lightColor,
    buttonTitle,
    simulateToggleInternetConnectivity,
    setUseRealConnectivity,
    isUsingRealConnectivity,
  };
};

export const useTrafficLight__xstate__controlledDependencies = () => {
  const [isUsingRealConnectivity, setIsUsingRealConnectionStatus] =
    useState(true);
  const [state, _send] = useActor(trafficLightMachine);
  const isReversed = state.context.reversed;
  const buttonTitle = isReversed
    ? "Simulate Internet Connected"
    : "Simulate Internet Disconnected";

  const lightColor = state.value as "green" | "yellow" | "red";

  const simulateToggleInternetConnectivity = () => {
    setIsUsingRealConnectionStatus(false);
    // Swap out the NetworkMonitorClient to simulate connectivity changes
    Controlled.networkMonitorClient = isReversed
      ? NetworkMonitorClient.satisfied()
      : NetworkMonitorClient.unsatisfied();
  };

  const setUseRealConnectivity = () => {
    Controlled.networkMonitorClient = NetworkMonitorClient.live();
    setIsUsingRealConnectionStatus(true);
  };

  return {
    lightColor,
    buttonTitle,
    simulateToggleInternetConnectivity,
    setUseRealConnectivity,
    isUsingRealConnectivity,
  };
};
