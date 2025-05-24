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
    const checkUser = async () => {
      const { data } = await auth.getSession();
      if (data.session) {
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

      <Card
        style={[
          styles.contentCard,
          { backgroundColor: paperTheme.colors.background },
        ]}
        mode="elevated"
        elevation={0}
      >
        <Card.Cover
          source={require("../assets/images/splash-palms.jpg")}
          style={styles.imageCardCover}
          resizeMode="cover"
        />

        <Card.Content style={styles.cardContent}>
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: paperTheme.colors.onBackground }]}
          >
            Znajdź atrakcje
          </Text>

          <Text
            variant="bodyLarge"
            style={[
              styles.subtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Odkrywaj nowe miejsca
          </Text>

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
    borderRadius: 28,
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
    borderRadius: 28,
    paddingVertical: 4,
  },
  buttonContent: {
    height: 48,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Welcome;
