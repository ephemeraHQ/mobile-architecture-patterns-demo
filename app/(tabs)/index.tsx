import React from "react";
import { Button, SafeAreaView, StyleSheet, View } from "react-native";
import {
  useTrafficLight__react__uncontrolledDependencies,
  useTrafficLight__xstate__controlledDependencies,
} from "@/Features/Traffic Light/trafficLight.hook";
import { ThemedText } from "@/components/ThemedText";
import { TrafficLight } from "@/Features/Traffic Light/components/TrafficLight";

export default function HomeScreen() {
  const {
    lightColor,
    buttonTitle,
    simulateToggleInternetConnectivity,
    setUseRealConnectivity,
    isUsingRealConnectivity,
    // } = useTrafficLight__xstate__controlledDependencies();
  } = useTrafficLight__react__uncontrolledDependencies();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TrafficLight currentLight={lightColor} />
        <ThemedText style={styles.text}>
          Using Real Connectivity: {isUsingRealConnectivity ? "Yes" : "No"}
        </ThemedText>
        <ThemedText style={styles.text}>
          Connected: {isUsingRealConnectivity ? "Yes" : "No"}
        </ThemedText>

        <Button
          onPress={simulateToggleInternetConnectivity}
          title={buttonTitle}
        />

        <Button
          onPress={setUseRealConnectivity}
          title={"Use Real Internet Connectivity Status"}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    marginVertical: 10,
  },
});
