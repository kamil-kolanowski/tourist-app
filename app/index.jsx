import React, { useEffect } from "react";
import { View } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { router } from "expo-router";
import { auth } from "../SimpleSupabaseClient";

const Welcome = () => {
  useEffect(() => {
    // Sprawdź, czy użytkownik jest zalogowany
    const checkUser = async () => {
      const { data } = await auth.getSession();
      if (data.session) {
        // Użytkownik jest zalogowany, przekieruj do głównej zakładki
        router.replace("/(tabs)");
      }
    };

    checkUser();
  }, []);

  const handleStart = () => {
    router.push("/auth/login");
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
};

export default Welcome;
