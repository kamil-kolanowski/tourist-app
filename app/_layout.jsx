import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

const RootLayout = () => {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="attractions/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </PaperProvider>
  );
};

export default RootLayout;
