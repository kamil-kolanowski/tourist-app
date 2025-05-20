import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Surface, List, Card } from "react-native-paper";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import { router } from "expo-router";

export default function HomeScreen() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const placesCollection = collection(db, "places");
      const placesSnapshot = await getDocs(placesCollection);
      const placesList = placesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlaces(placesList);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleLarge">Witaj w Tourist App</Text>
            <Text variant="bodyMedium">Odkryj nowe miejsca w okolicy</Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Popularne miejsca
        </Text>

        {loading ? (
          <Text>Ładowanie...</Text>
        ) : places.length === 0 ? (
          <Text>Brak dostępnych miejsc</Text>
        ) : (
          places.map((place) => (
            <Card
              key={place.id}
              style={{ marginBottom: 8 }}
              onPress={() => router.push(`/places/${place.id}`)}
            >
              <Card.Title
                title={place.name}
                subtitle={place.description}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
              />
            </Card>
          ))
        )}

        <Button
          mode="outlined"
          onPress={async () => {
            await auth.signOut();
            router.replace("/");
          }}
          style={{ marginTop: 16 }}
        >
          Wyloguj się
        </Button>
      </ScrollView>
    </Surface>
  );
}
