import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, TextInput, Button, Surface, Card } from "react-native-paper";
import { router } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { useAuth } from "../../contexts/AuthContext";

const AddPlace = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  console.log("AddPlace - stan auth:", {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
  });

  // Dodaj warunek dla niezalogowanego użytkownika
  if (!isAuthenticated || !user) {
    console.log("Przekierowanie do logowania z add-place");
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 300);

    return (
      <Surface
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
      </Surface>
    );
  }

  const handleAddPlace = async () => {
    if (!name || !description || !address || !category) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    if (!user) {
      alert("Musisz być zalogowany, aby dodać miejsce");
      return;
    }

    setLoading(true);
    try {
      const placeData = {
        name,
        description,
        address,
        category,
        created_at: new Date().toISOString(),
        created_by: user.id,
        rating: 0,
        ratings_count: 0,
      };

      console.log("Dodaję miejsce:", placeData);

      // Używamy bezpośrednio db zamiast kontekstu
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

      alert("Miejsce zostało dodane pomyślnie!");
      router.push({
        pathname: "/(tabs)",
        params: { refresh: Date.now() },
      }); // Przekieruj do strony głównej
    } catch (error) {
      console.error("Error adding place:", error);
      alert("Wystąpił błąd podczas dodawania miejsca");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
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

            <Button
              mode="contained"
              onPress={handleAddPlace}
              loading={loading}
              disabled={loading}
            >
              Dodaj miejsce
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
};

export default AddPlace;
