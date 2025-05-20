import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { router } from "expo-router";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error) {
      setError(error.message);
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
        >
          Zarejestruj się
        </Button>

        <Button mode="text" onPress={() => router.push("/auth/login")}>
          Masz już konto? Zaloguj się
        </Button>
      </View>
    </Surface>
  );
}

export default Register;
