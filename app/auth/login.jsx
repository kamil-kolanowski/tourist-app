import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, Surface, useTheme } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAuthenticated } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated && user) {
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

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Surface style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <Text variant="headlineLarge" style={styles.appTitle}>
                Tourist App
              </Text>

              <Text variant="headlineSmall" style={styles.subtitle}>
                Logowanie
              </Text>

              <Text style={styles.inputLabel}>E-mail</Text>

              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Hasło</Text>

              <TextInput
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />

              {error && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Zaloguj się
              </Button>

              <Button mode="text" onPress={() => router.push("/auth/register")}>
                Nie masz konta? Zarejestruj się
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  appTitle: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    marginBottom: 20,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    marginBottom: 16,
    paddingVertical: 6,
  },
});

export default Login;
