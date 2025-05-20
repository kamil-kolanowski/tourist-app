import React from "react";
import { ScrollView } from "react-native";
import { Text, Button, Surface, Card } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams();

  const mockPlace = {
    id: id,
    name: `Miejsce ${id}`,
    description: "Szczegółowy opis miejsca...",
    rating: 4.5,
  };

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }}>
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
              {mockPlace.name}
            </Text>
            <Text variant="bodyLarge" style={{ marginBottom: 8 }}>
              {mockPlace.description}
            </Text>
            <Text variant="titleMedium">Ocena: {mockPlace.rating}/5</Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => router.push(`/places/reviews/${id}`)}
        >
          Dodaj opinię
        </Button>
      </ScrollView>
    </Surface>
  );
}
