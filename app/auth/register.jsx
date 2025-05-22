import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { db } from "../../SimpleSupabaseClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    if (!email || !password) {
      setError("Email i hasło są wymagane");
      return;
    }

    if (!displayName) {
      setError("Nazwa użytkownika jest wymagana");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Przekazujemy displayName jako username w user_metadata
      const { error: signUpError } = await signUp(email, password, {
        username: displayName,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Utworzenie wpisu w tabeli profiles
      try {
        // Pobierz ID użytkownika po rejestracji
        const { data: userData } = await auth.getUser();
        if (userData?.user?.id) {
          console.log("Tworzenie profilu dla użytkownika:", userData.user.id);
          const { error: profileError } = await db.from("profiles").insert([
            {
              id: userData.user.id,
              username: displayName,
              updated_at: new Date().toISOString(),
            },
          ]);

          if (profileError) {
            console.error("Błąd tworzenia profilu:", profileError);
          }
        }
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
      }

      router.replace("/(tabs)");
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji");
      console.error(error);
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
          Rejestracja
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
          label="Nazwa użytkownika"
          value={displayName}
          onChangeText={setDisplayName}
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

        <TextInput
          mode="outlined"
          label="Potwierdź hasło"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
          onPress={handleRegister}
          style={{ marginBottom: 12 }}
          loading={loading}
          disabled={loading}
        >
          Zarejestruj się
        </Button>

        <Button mode="text" onPress={() => router.push("/auth/login")}>
          Masz już konto? Zaloguj się
        </Button>
      </View>
    </Surface>
  );
};

export default Register;
