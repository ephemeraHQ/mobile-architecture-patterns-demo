import { renderHook, act } from "@testing-library/react-native";
import { Controlled } from "@/Dependencies/Environment/Environment";
import { NetworkMonitorClient } from "@/Dependencies/NetworkMonitor/NetworkMonitor";
import { BehaviorSubject } from "rxjs";
import { NetworkAvailability } from "@/Dependencies/NetworkMonitor/NetworkMonitor";
import { useTrafficLight__xstate__controlledDependencies } from "@/Features/Traffic Light/trafficLight.hook";

describe("useTrafficLight__xstate__controlledDependencies", () => {
  let OriginalCurrent: typeof Controlled;
  beforeEach(() => {
    OriginalCurrent = { ...Controlled };
  });
  afterEach(() => {
    Object.entries(OriginalCurrent).forEach(([key, value]) => {
      Controlled[key as keyof typeof Controlled] = value as any;
    });
  });

  test("should initialize with green light when internet is connected", () => {
    // Simulate internet connected
    Controlled.networkMonitorClient = NetworkMonitorClient.satisfied();

    const { result } = renderHook(() =>
      useTrafficLight__xstate__controlledDependencies(),
    );

    expect(result.current.lightColor).toBe("green");
    expect(result.current.isUsingRealConnectivity).toBe(true);
    expect(result.current.buttonTitle).toBe("Simulate Internet Disconnected");
  });

  test("should reverse sequence when internet is disconnected", () => {
    // Simulate internet disconnected
    Controlled.networkMonitorClient = NetworkMonitorClient.unsatisfied();

    const { result } = renderHook(() =>
      useTrafficLight__xstate__controlledDependencies(),
    );

    expect(result.current.lightColor).toBe("green");
    expect(result.current.isUsingRealConnectivity).toBe(true);
    expect(result.current.buttonTitle).toBe("Simulate Internet Connected");
  });

  test("should toggle internet connectivity simulation", () => {
    Controlled.networkMonitorClient = NetworkMonitorClient.satisfied();

    const { result } = renderHook(() =>
      useTrafficLight__xstate__controlledDependencies(),
    );

    // Simulate toggling internet connectivity
    act(() => {
      result.current.simulateToggleInternetConnectivity();
    });

    expect(result.current.isUsingRealConnectivity).toBe(false);
    expect(result.current.buttonTitle).toBe("Simulate Internet Connected");
  });

  test("should cycle through light colors correctly", async () => {
    jest.useFakeTimers();
    Controlled.networkMonitorClient = NetworkMonitorClient.satisfied();

    const { result } = renderHook(() =>
      useTrafficLight__xstate__controlledDependencies(),
    );

    expect(result.current.lightColor).toBe("green");

    // Fast-forward time to trigger state transitions
    act(() => {
      jest.advanceTimersByTime(2000); // Green to Yellow
    });
    expect(result.current.lightColor).toBe("yellow");

    act(() => {
      jest.advanceTimersByTime(2000); // Yellow to Red
    });
    expect(result.current.lightColor).toBe("red");

    act(() => {
      jest.advanceTimersByTime(3500); // Red to Green
    });
    expect(result.current.lightColor).toBe("green");

    jest.useRealTimers();
  });

  test("should respond to network connectivity changes", () => {
    jest.useFakeTimers();

    // Use a BehaviorSubject to simulate network changes
    const internetConnectivitySubject =
      new BehaviorSubject<NetworkAvailability>({
        status: "satisfied",
      });

    Controlled.networkMonitorClient = NetworkMonitorClient.custom(
      internetConnectivitySubject,
    );

    const { result } = renderHook(() =>
      useTrafficLight__xstate__controlledDependencies(),
    );

    expect(result.current.lightColor).toBe("green");

    // Simulate internet disconnect
    act(() => {
      internetConnectivitySubject.next({ status: "unsatisfied" });
    });

    expect(result.current.buttonTitle).toBe("Simulate Internet Connected");

    jest.useRealTimers();
  });
});
