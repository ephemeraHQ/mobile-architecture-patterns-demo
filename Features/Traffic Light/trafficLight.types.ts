import { z } from "zod";
import type { ZodSchemaType } from "../storage.types";

export const timingMode = z.enum(["normal", "fast"]);
export type TimingMode = z.infer<typeof timingMode>;

export const trafficLightDataSchema = {
  qaSettings: z.object({ timingMode }),
  trafficLight: z.object({ counter: z.number() }),
};

export const TraffficLightDefaultValues = {
  qaSettings: {
    timingMode: "normal",
  } satisfies ZodSchemaType<"qaSettings">,

  trafficLight: {
    counter: 0,
  } satisfies ZodSchemaType<"trafficLight">,
};
