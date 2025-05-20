import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Logowanie",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerTitle: "Rejestracja",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
