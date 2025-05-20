import React, { useState } from "react";
import { View } from "react-native";
import { Searchbar, List, Surface } from "react-native-paper";
import { router } from "expo-router";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [places] = useState([
    { id: 1, name: "Miejsce 1", category: "Zabytki" },
    { id: 2, name: "Miejsce 2", category: "Restauracje" },
  ]);

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Surface style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Searchbar
          placeholder="Szukaj miejsc..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {filteredPlaces.map((place) => (
          <List.Item
            key={place.id}
            title={place.name}
            description={place.category}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            onPress={() => router.push(`/places/${place.id}`)}
          />
        ))}
      </View>
    </Surface>
  );
}
