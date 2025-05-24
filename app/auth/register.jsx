import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  Avatar,
} from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { db, auth, storage } from "../../SimpleSupabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../services/StorageService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { signUp } = useAuth();
  const theme = useTheme();

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Błąd podczas wybierania zdjęcia:", error);
      alert("Wystąpił błąd podczas wybierania zdjęcia");
    }
  };

  const handleUploadProfileImage = async (userId) => {
    if (!profileImage?.uri) return null;

    try {
      setUploadingImage(true);

      const fileExt = profileImage.uri.split(".").pop();
      const fileName = `profile_${userId}_${Date.now()}`;

      const publicUrl = await uploadImage(profileImage.uri, fileName);

      return publicUrl;
    } catch (error) {
      console.error("Błąd podczas przesyłania zdjęcia:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

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
      const { error: signUpError } = await signUp(email, password, {
        username: displayName,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { data: userData } = await auth.getUser();

      if (userData?.user?.id) {
        console.log("Tworzenie profilu dla użytkownika:", userData.user.id);

        let avatarUrl = null;
        if (profileImage) {
          avatarUrl = await handleUploadProfileImage(userData.user.id);
        }

        const { error: profileError } = await db.from("profiles").insert([
          {
            id: userData.user.id,
            username: displayName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
        ]);

        if (avatarUrl) {
          await auth.updateUser({
            data: {
              avatar_url: avatarUrl,
              username: displayName,
            },
          });
        }

        if (profileError) {
          console.error("Błąd tworzenia profilu:", profileError);
        }
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
                Rejestracja
              </Text>

              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={pickProfileImage}>
                  {profileImage ? (
                    <Avatar.Image
                      size={100}
                      source={{ uri: profileImage.uri }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Avatar.Icon
                      size={100}
                      icon="camera"
                      style={styles.profileImagePlaceholder}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.profileImageHint}>
                  Dotknij, aby dodać zdjęcie profilowe
                </Text>
              </View>

              <Text style={styles.inputLabel}>E-mail</Text>

              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Nazwa użytkownika</Text>

              <TextInput
                mode="outlined"
                value={displayName}
                onChangeText={setDisplayName}
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

              <Text style={styles.inputLabel}>Potwierdź hasło</Text>

              <TextInput
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
                onPress={handleRegister}
                style={styles.button}
                loading={loading || uploadingImage}
                disabled={loading || uploadingImage}
              >
                Zarejestruj się
              </Button>

              <Button mode="text" onPress={() => router.push("/auth/login")}>
                Masz już konto? Zaloguj się
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
    marginBottom: 24,
    textAlign: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    backgroundColor: "transparent",
  },
  profileImagePlaceholder: {
    backgroundColor: "#e1e1e1",
  },
  profileImageHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
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

export default Register;
