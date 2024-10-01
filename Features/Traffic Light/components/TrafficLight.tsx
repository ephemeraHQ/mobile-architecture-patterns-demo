import React from "react";
import { View, StyleSheet } from "react-native";

type TrafficLightProps = {
  currentLight: "green" | "yellow" | "red";
};

export const TrafficLight: React.FC<TrafficLightProps> = ({ currentLight }) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.light,
          styles.red,
          currentLight === "red" && styles.active,
        ]}
      />
      <View
        style={[
          styles.light,
          styles.yellow,
          currentLight === "yellow" && styles.active,
        ]}
      />
      <View
        style={[
          styles.light,
          styles.green,
          currentLight === "green" && styles.active,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 300,
    backgroundColor: "black",
    borderRadius: 50,
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
  },
  light: {
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  active: {
    opacity: 1,
  },
  red: {
    backgroundColor: "red",
  },
  yellow: {
    backgroundColor: "yellow",
  },
  green: {
    backgroundColor: "green",
  },
});
