import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, TextInput, Button, Surface, Card } from "react-native-paper";
import { router } from "expo-router";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../FirebaseConfig";

function AddPlace() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPlace = async () => {
    if (!name || !description || !address || !category) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    setLoading(true);
    try {
      const placesCollection = collection(db, "places");
      await addDoc(placesCollection, {
        name,
        description,
        address,
        category,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid,
        rating: 0,
        ratingsCount: 0,
      });

      // Wyczyść formularz
      setName("");
      setDescription("");
      setAddress("");
      setCategory("");

      alert("Miejsce zostało dodane pomyślnie!");
      router.push("/(tabs)"); // Przekieruj do strony głównej
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
}

export default AddPlace;
