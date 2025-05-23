import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  Text,
  Button,
  Surface,
  useTheme as usePaperTheme,
  Avatar,
  Card,
} from "react-native-paper";
import { router } from "expo-router";
import { auth } from "../SimpleSupabaseClient";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../contexts/ThemeContext";

const Welcome = () => {
  const paperTheme = usePaperTheme();
  const { isDarkTheme } = useTheme();

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
    <Surface
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <StatusBar style={isDarkTheme ? "light" : "dark"} />

      {/* Używamy Card jako głównego kontenera dla lepszej zgodności z Material Design */}
      <Card
        style={[
          styles.contentCard,
          { backgroundColor: paperTheme.colors.background },
        ]}
        mode="elevated"
        elevation={0}
      >
        {/* Zdjęcie palm jako Card.Cover */}
        <Card.Cover
          source={require("../assets/images/splash-palms.jpg")}
          style={styles.imageCardCover}
          resizeMode="cover"
        />

        <Card.Content style={styles.cardContent}>
          {/* Nagłówek */}
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: paperTheme.colors.onBackground }]}
          >
            Znajdź atrakcje
          </Text>

          {/* Podtytuł */}
          <Text
            variant="bodyLarge"
            style={[
              styles.subtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Odkrywaj nowe miejsca
          </Text>

          {/* Przycisk */}
          <Button
            mode="contained"
            onPress={handleStart}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Odkrywaj
          </Button>
        </Card.Content>
      </Card>
    </Surface>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 28, // Material Design 3 rounded corners (large)
    overflow: "hidden",
  },
  imageCardCover: {
    height: 280,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: {
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    borderRadius: 28, // Material Design 3 button corners
    paddingVertical: 4,
  },
  buttonContent: {
    height: 48, // Standard Material Design button height
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Welcome;
