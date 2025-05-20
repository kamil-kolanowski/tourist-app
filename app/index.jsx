import React from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { router } from "expo-router";
import { auth } from "../FirebaseConfig";

export default function Welcome() {
  const handleStart = () => {
    if (auth.currentUser) {
      router.replace("/(tabs)");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          variant="headlineLarge"
          style={{ marginBottom: 20, textAlign: "center" }}
        >
          Witaj w Tourist App
        </Text>

        <Button mode="contained" onPress={handleStart}>
          Rozpocznij
        </Button>
      </View>
    </Surface>
  );
}
