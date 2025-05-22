import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAuthenticated } = useAuth();

  // Dodaj efekt, który sprawdza stan autentykacji
  useEffect(() => {
    console.log("Login - stan auth:", { isAuthenticated, userId: user?.id });
    if (isAuthenticated && user) {
      console.log("Użytkownik już zalogowany, przekierowuję do (tabs)");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email i hasło są wymagane");
      return;
    }

    setLoading(true);
    setError("");

    // Wyświetl dane logowania (tylko do debugowania)
    console.log("Próba logowania z danymi:", {
      email,
      passwordLength: password.length,
    });

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        console.error("Błąd logowania:", signInError);
        setError(signInError.message);
        return;
      }

      console.log("Logowanie zakończone sukcesem, przekierowanie");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Złapany błąd podczas logowania:", error);
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
        <Text
          variant="headlineMedium"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          Logowanie
        </Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          mode="outlined"
          label="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: 12 }}
        />

        {error && (
          <Text style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={{ marginBottom: 12 }}
          loading={loading}
          disabled={loading}
        >
          Zaloguj się
        </Button>

        <Button mode="text" onPress={() => router.push("/auth/register")}>
          Nie masz konta? Zarejestruj się
        </Button>
      </View>
    </Surface>
  );
};

export default Login;
