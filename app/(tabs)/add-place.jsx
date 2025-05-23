import React, { useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Surface,
  Card,
  ActivityIndicator,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { db, storage } from "../../SimpleSupabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { decode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadImage as uploadImageToStorage } from "../../services/StorageService";
import { useTheme } from "../../contexts/ThemeContext";

const AddPlace = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const paperTheme = usePaperTheme();
  const { isDarkTheme } = useTheme();

  console.log("AddPlace - stan auth:", {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
  });

  // Funkcja do wyboru zdjęcia z galerii
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        // Usunięto base64: true - nie jest już potrzebne
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Błąd podczas wybierania zdjęcia:", error);
      alert("Wystąpił błąd podczas wybierania zdjęcia");
    }
  };

  // Funkcja do przesyłania zdjęcia do Supabase Storage

  const uploadImage = async () => {
    if (!image?.uri) return null;

    setUploadingImage(true);
    try {
      const fileExt = image.uri.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `place_images/${fileName}`;

      // Utwórz FormData do przesłania pliku
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: fileName,
        type: `image/${fileExt}`,
      });

      // Pobierz token sesji z AsyncStorage
      let sessionData = null;
      try {
        const storedSession = await AsyncStorage.getItem("supabase_session");
        if (storedSession) {
          sessionData = JSON.parse(storedSession);
        }
      } catch (e) {
        console.error("Błąd ładowania sesji:", e);
      }

      // Utwórz nagłówki autoryzacji
      const headers = {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs",
        Authorization: sessionData?.access_token
          ? `Bearer ${sessionData.access_token}`
          : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs`,
      };

      // POPRAWKA: Używamy prawidłowej nazwy bucketa "attraction-images" zamiast "place-images"
      // Używamy bezpośrednio API Supabase Storage
      const response = await fetch(
        `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/attraction-images/${filePath}`,
        {
          method: "POST",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Błąd odpowiedzi Supabase Storage:", errorText);
        throw new Error(`Błąd przesyłania: ${response.status} ${errorText}`);
      }

      // POPRAWKA: Używamy prawidłowej nazwy bucketa "attraction-images" w URL publicznym
      const publicUrl = `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/public/attraction-images/${filePath}`;

      console.log("Przesłano zdjęcie pomyślnie, URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Błąd podczas przesyłania zdjęcia:", error);
      alert("Wystąpił błąd podczas przesyłania zdjęcia");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Dodaj warunek dla niezalogowanego użytkownika
  if (!isAuthenticated || !user) {
    console.log("Przekierowanie do logowania z add-place");
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 300);

    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Musisz być zalogowany, aby dodać nowe miejsce</Text>
        <Button
          mode="contained"
          onPress={() => router.replace("/auth/login")}
          style={{ marginTop: 20 }}
        >
          Zaloguj się
        </Button>
      </SafeAreaView>
    );
  }

  const handleAddPlace = async () => {
    if (!name || !description || !address || !category) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    setLoading(true);
    try {
      // Najpierw prześlij zdjęcie jeśli zostało wybrane
      const imageUrl = image ? await uploadImage() : null;

      const placeData = {
        name,
        description,
        address,
        category,
        created_at: new Date().toISOString(),
        created_by: user.id,
        rating: 0,
        ratings_count: 0,
        image_url: imageUrl, // Dodaj URL zdjęcia
      };

      console.log("Dodaję miejsce:", placeData);

      const { data, error } = await db.from("places").insert([placeData]);

      if (error) {
        console.error("Błąd dodawania miejsca:", error);
        throw error;
      }

      console.log("Dodano miejsce:", data);

      // Wyczyść formularz
      setName("");
      setDescription("");
      setAddress("");
      setCategory("");
      setImage(null);

      alert("Miejsce zostało dodane pomyślnie!");
      router.push({
        pathname: "/(tabs)",
        params: { refresh: Date.now() },
      });
    } catch (error) {
      console.error("Error adding place:", error);
      alert("Wystąpił błąd podczas dodawania miejsca");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkTheme ? paperTheme.colors.background : "white",
      }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <Surface
          style={{
            flex: 1,
            backgroundColor: paperTheme.colors.background,
          }}
        >
          <ScrollView
            style={{ padding: 16 }}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text
                  variant="headlineMedium"
                  style={{
                    marginBottom: 16,
                    color: paperTheme.colors.onSurface,
                  }}
                >
                  Dodaj nowe miejsce
                </Text>

                <TextInput
                  mode="outlined"
                  label="Nazwa miejsca"
                  value={name}
                  onChangeText={setName}
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  mode="outlined"
                  label="Opis"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  mode="outlined"
                  label="Adres"
                  value={address}
                  onChangeText={setAddress}
                  style={{ marginBottom: 12 }}
                />

                <TextInput
                  mode="outlined"
                  label="Kategoria"
                  value={category}
                  onChangeText={setCategory}
                  style={{ marginBottom: 16 }}
                />

                {/* Sekcja zdjęcia */}
                <Text
                  variant="titleMedium"
                  style={{
                    marginBottom: 8,
                    color: paperTheme.colors.onSurface,
                  }}
                >
                  Zdjęcie miejsca
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.imagePicker}
                >
                  {image ? (
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text
                        style={{ color: paperTheme.colors.onSurfaceVariant }}
                      >
                        Dotknij, aby wybrać zdjęcie
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {image && (
                  <Button
                    mode="outlined"
                    onPress={() => setImage(null)}
                    style={{ marginTop: 8, marginBottom: 16 }}
                  >
                    Usuń zdjęcie
                  </Button>
                )}

                <Button
                  mode="contained"
                  onPress={handleAddPlace}
                  loading={loading || uploadingImage}
                  disabled={loading || uploadingImage}
                  style={{ marginTop: 16, marginBottom: 40 }}
                >
                  Dodaj miejsce
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
  },
});

export default AddPlace;
