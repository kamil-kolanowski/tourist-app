import "../polyfills"; // To musi być pierwszy import
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";

export const unstable_settings = {
  initialRouteName: "index",
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <PaperProvider>
        <Stack>
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
    </AuthProvider>
  );
};

export default RootLayout;
