import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export const unstable_settings = {
  initialRouteName: "index",
};

const RootLayout = () => {
  return (
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
  );
};

export default RootLayout;
