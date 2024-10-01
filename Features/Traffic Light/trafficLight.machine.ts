import { Controlled } from "@/Dependencies/Environment/Environment";
import { assign, fromCallback, setup } from "xstate";

type TrafficLightContext = {
  /* Reversed if the internet is disconnected */
  reversed: boolean;
};

type TrafficLightEvents =
  | { type: "internet.disconnected" }
  | { type: "internet.connected" };

export const trafficLightMachine = setup({
  types: {
    context: {} as TrafficLightContext,
    events: {} as TrafficLightEvents,
  },
  delays: {
    greenDelayMs: 2000,
    yellowDelayMs: 2000,
    redDelayMs: 3500,
  },
  guards: {
    isReversed: ({ context }) => context.reversed,
    isNotReversed: ({ context }) => !context.reversed,
  },
  actions: {
    reverseLightFlow: assign({
      reversed: true,
    }),
    makeLightFlowNormal: assign({
      reversed: false,
    }),
  },
  actors: {
    internetConnectivity: fromCallback<
      { type: "internet.disconnected" } | { type: "internet.connected" }
    >(({ sendBack }) => {
      const networkMonitorClient = Controlled.networkMonitorClient;

      const subscription = networkMonitorClient.subscribe((state) => {
        if (state.status === "satisfied") {
          sendBack({
            type: "internet.connected",
          } as const);
        } else {
          sendBack({
            type: "internet.disconnected",
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAWXTxJwDswBJCAYjuTFXuQDoIdY8Ae1r087CAG0ADAF1EoAA6DYOZDmHyQAD0QBGKVICc3ABwmAbCYAsUgKxSAzOYBMJ2wBoQATz1ST3K1sHXV1nBwB2Qytw4PCAXzjPNCxcQmIySmo6RhY2Di5uIREwMUhpOSQQJRU1DUqdBH1nKW5LcPMrDpMw8NdPH0bnBKSMbHwiUgoqGnombihUMDBaZi1YZHR2bix2VAAKBaXaABEwABt0L3JYAEpmZLG0ycyZnPnF5fLNatV1Wk0GrZnOZuOFrLoHLZzO0rCYpOF+noQs4AoZnK4TLogkETA5hiAHqkJhlptk5odlqt1pswNtMLsDh8TudLtc7oTxukpllZhB3kcJLoKoplL86qAGhYAoErA4TIYIYZDAYEd5EBFwqYrFZnLZwlIbIbdOZ8RyniSeW8vOczoIAO5UjZbHYcPbWs62u2nC5XW73UZErkvMl892er6VH61f71RBA2zcKTAhwOKz6LHmBWIhB6qzcZy6GzQ+zmSy2XSmgOc56k3ncMP2x00ukMhtelm+9lV83c15zNuC4VVUXRgGIQwRVodSKQox643Z-Ta7iprERWzRKK6eKJAnd4m9kPcRYsNZO2ku-Yn72sv1mg-BusniMimp-MeNcyQgK2bohUtpqWujZnCCZGA4fidCY+obkMu73kGtZvCeTbOvSrrXh2bL+ik1YWn2fLPkK3wju+saNNuLQOOi5ZSOYEJmDEIF2ImE6FiEuiYtBFb4rQggQHAmgITWlpMCRb7ito6r+NqG5ygqDhKiqVjZoYMk6r0bgGIY9GGLYla4T2j5vBSMavmKZlSQgOoJqE5jlui8q2EqEKLmEIJ0WEznQWiziGAZjwPkh-Y2va4kWR+sqagav5wvKpa6qqAzhMaqJuLoOlgk0AWBiJBHHpA4WjuRMqJvR9FwnYCmONmEEONKzgpVluKYhuCQJEAA */
  id: "trafficLightMachineId",
  invoke: {
    src: "internetConnectivity",
  },
  on: {
    "internet.disconnected": {
      actions: "reverseLightFlow",
    },
    "internet.connected": {
      actions: "makeLightFlowNormal",
    },
  },
  description: `
    This machine simulates a contrived traffic light system with 
    that reversed the normal traffic light cycle when the internet 
    is disconnected.
  `,
  context: { reversed: false },

  initial: "green",

  states: {
    green: {
      description: `
        Transitions to the yellow state after the green light duration
        has elapsed.
          
        If reversed (for internet connectivity demo), this would transition to the red state.
      `,
      after: {
        greenDelayMs: [
          {
            guard: "isNotReversed",
            target: "yellow",
          },
          {
            guard: "isReversed",
            target: "red",
          },
        ],
      },
    },

    yellow: {
      description: `
        Transitions to the red state after the yellow light duration
        has elapsed.
        
        If reversed (for internet connectivity demo), this would transition to the green state. 
      `,
      after: {
        yellowDelayMs: [
          {
            guard: "isNotReversed",
            target: "red",
          },
          {
            guard: "isReversed",
            target: "green",
          },
        ],
      },
    },

    red: {
      description: `
        Transitions to the green state after the red light duration
        has elapsed.
        
        If reversed (for internet connectivity demo), this would transition to the yellow state.
      `,

      after: {
        redDelayMs: [
          {
            guard: "isNotReversed",
            target: "green",
          },
          {
            guard: "isReversed",
            target: "yellow",
          },
        ],
      },
    },
  },
});
