import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import {
  Searchbar,
  List,
  Text,
  Button,
  Card,
  Surface,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { db } from "../../SimpleSupabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { Platform } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width - 32;

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const paperTheme = usePaperTheme();
  const { isDarkTheme } = useTheme();

  const searchBackgroundColor = isDarkTheme ? "#333333" : "#f5f5f5";

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);

      const { data, error } = await db.from("places").select("*");

      if (error) throw error;

      const query = searchQuery.toLowerCase().trim();
      const filteredResults = (data || []).filter(
        (place) =>
          place.name.toLowerCase().includes(query) ||
          place.description.toLowerCase().includes(query) ||
          place.address.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query)
      );

      setResults(filteredResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setResults([]);
  };

  const renderResultItem = ({ item }) => (
    <Card
      key={item.id}
      style={styles.resultCard}
      onPress={() => router.push(`/places/${item.id}`)}
    >
      {item.image_url && (
        <Card.Cover
          source={{ uri: item.image_url }}
          style={styles.placeImage}
        />
      )}
      <Card.Title
        title={item.name}
        subtitle={`${item.category} • ${item.address}`}
        left={(props) => <List.Icon {...props} icon="map-marker" />}
        titleStyle={{ color: paperTheme.colors.onSurface }}
        subtitleStyle={{ color: paperTheme.colors.onSurfaceVariant }}
        titleNumberOfLines={1}
        subtitleNumberOfLines={2}
      />
      <Card.Content>
        <Text
          numberOfLines={2}
          style={[
            styles.description,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      edges={["top"]}
    >
      <Surface
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Szukaj miejsc..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={[
              styles.searchbar,
              { backgroundColor: searchBackgroundColor },
            ]}
            iconColor={paperTheme.colors.onSurface}
            inputStyle={{ color: paperTheme.colors.onSurface }}
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
            clearIcon="close"
            clearIconColor={paperTheme.colors.onSurface}
            theme={{
              colors: {
                elevation: {
                  level0: searchBackgroundColor,
                },
              },
            }}
          />
          <Button
            mode="contained"
            onPress={handleSearch}
            loading={loading}
            style={styles.searchButton}
            buttonColor={paperTheme.colors.primary}
          >
            Szukaj
          </Button>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text
              variant="titleMedium"
              style={{ color: paperTheme.colors.onSurface }}
            >
              Znaleziono {results.length} miejsc
            </Text>
            <Button
              mode="text"
              onPress={resetSearch}
              textColor={paperTheme.colors.primary}
            >
              Wyczyść
            </Button>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {results.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.emptyStateContainer}
              showsVerticalScrollIndicator={true}
            >
              {searchQuery ? (
                <Text
                  style={[
                    styles.noResults,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  Nie znaleziono miejsc
                </Text>
              ) : (
                <Text
                  style={[
                    styles.instruction,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  Wyszukaj miejsca wpisując nazwę, lokalizację lub kategorię
                </Text>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{
                paddingBottom: Platform.OS === "ios" ? 120 : 110,
                paddingHorizontal: 16,
                width: "100%",
              }}
            />
          )}
        </View>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    height: 50,
    justifyContent: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsContainer: {
    paddingTop: 0,
  },
  resultCard: {
    marginBottom: 12,
    width: cardWidth,
    alignSelf: "center",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  placeImage: {
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  description: {
    marginTop: 8,
    marginBottom: 12,
  },
  noResults: {
    textAlign: "center",
    marginTop: 40,
  },
  instruction: {
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchScreen;
