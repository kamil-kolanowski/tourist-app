import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { Text, Button, Surface, List, Card } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "../../SimpleSupabaseClient";

const HomeScreen = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { signOut } = useAuth();
  const params = useLocalSearchParams();

  // Dodaj log do sprawdzenia czy miejsca są pobierane
  console.log("Aktualne miejsca:", places.length);

  // Dodaj efekt, który będzie nasłuchiwał na zmiany parametrów
  useEffect(() => {
    console.log("Parametry zmieniły się:", params);
    fetchPlaces();
  }, [params.refresh]);

  // Zawsze wywołaj fetchPlaces przy montowaniu komponentu
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      console.log("Pobieranie miejsc...");
      setLoading(true);

      const { data, error } = await db.from("places").select("*");

      if (error) {
        console.error("Błąd pobierania miejsc:", error);
        throw error;
      }

      console.log("Pobrano miejsc:", data?.length || 0);
      setPlaces(data || []);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces();
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView
        style={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleLarge">Witaj w Tourist App</Text>
            <Text variant="bodyMedium">Odkryj nowe miejsca w okolicy</Text>
            <Button
              icon="refresh"
              mode="text"
              onPress={fetchPlaces}
              loading={loading && !refreshing}
              style={{ marginTop: 8 }}
            >
              Odśwież listę
            </Button>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Popularne miejsca {places.length > 0 ? `(${places.length})` : ""}
        </Text>

        {loading && !refreshing ? (
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
          onPress={handleSignOut}
          style={{ marginTop: 16 }}
        >
          Wyloguj się
        </Button>
      </ScrollView>
    </Surface>
  );
};

export default HomeScreen;
