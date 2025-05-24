import "../polyfills";
import { Stack } from "expo-router";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  initialRouteName: "index",
};

const AppWithTheme = () => {
  const { theme, isDarkTheme } = useTheme();

  const paperTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkTheme ? "#121212" : "white",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: isDarkTheme ? "#121212" : "white",
          },
          headerTintColor: isDarkTheme ? "white" : "black",
          headerLayoutPreset: "center",
          safeAreaInsets: { top: 10 },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="places/[id]"
          options={{
            headerTitle: "Szczegóły miejsca",
            headerBackTitle: "Wróć",
          }}
        />
        <Stack.Screen
          name="places/reviews/[id]"
          options={{
            headerTitle: "Dodaj opinię",
            headerBackTitle: "Wróć",
          }}
        />
      </Stack>
    </PaperProvider>
  );
};

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
