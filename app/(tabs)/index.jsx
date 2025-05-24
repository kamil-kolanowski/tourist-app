import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  Platform,
  FlatList,
  Image,
} from "react-native";
import {
  Text,
  Surface,
  List,
  Card,
  Searchbar,
  useTheme as usePaperTheme,
  TouchableRipple,
} from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const paperTheme = usePaperTheme();
  const { isDarkTheme } = useTheme();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const params = useLocalSearchParams();

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    filterPlaces(query, selectedCategory);
  };

  const filterPlaces = (query = searchQuery, category = selectedCategory) => {
    let filtered = [...places];

    if (category) {
      filtered = filtered.filter((place) => place.category === category);
    }

    if (query.trim() !== "") {
      const searchLower = query.toLowerCase().trim();
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(searchLower) ||
          place.description.toLowerCase().includes(searchLower) ||
          place.category.toLowerCase().includes(searchLower) ||
          place.address.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPlaces(filtered);
  };

  const selectCategory = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      filterPlaces(searchQuery, null);
    } else {
      setSelectedCategory(category);
      filterPlaces(searchQuery, category);
    }
  };

  useEffect(() => {
    console.log("Parametry zmieniły się:", params);
    fetchPlaces();
  }, [params.refresh]);

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
      setFilteredPlaces(data || []);

      if (data && data.length > 0) {
        const uniqueCategories = [
          ...new Set(data.map((place) => place.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces();
  };

  const renderPlaceItem = ({ item }) => (
    <View
      style={{
        width: "48%",
        margin: 4,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: isDarkTheme ? "#1E1E1E" : "#ffffff",
      }}
    >
      <TouchableRipple
        onPress={() => router.push(`/places/${item.id}`)}
        style={{
          borderRadius: 12,
          overflow: "hidden",
        }}
        rippleColor="rgba(0, 0, 0, 0.1)"
      >
        <View>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{
                height: 140,
                width: "100%",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                height: 140,
                width: "100%",
                backgroundColor: isDarkTheme ? "#333" : "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <MaterialIcons
                name="photo"
                size={40}
                color={isDarkTheme ? "#666" : "#ccc"}
              />
            </View>
          )}

          <View style={{ padding: 10, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: isDarkTheme ? "#ffffff" : "#000000",
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
        </View>
      </TouchableRipple>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      edges={["top"]}
    >
      <Surface
        style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      >
        <View style={{ paddingBottom: 0 }}>
          <Text
            variant="headlineMedium"
            style={{
              marginTop: 16,
              marginBottom: 8,
              marginLeft: 16,
              color: paperTheme.colors.onSurface,
            }}
          >
            Odkryj nowe miejsca
          </Text>

          <Searchbar
            placeholder="Szukaj miejsc..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={{
              margin: 16,
              marginTop: 8,
              marginBottom: 8,
              backgroundColor: isDarkTheme ? "#333333" : "#f5f5f5",
            }}
            iconColor={paperTheme.colors.onSurface}
            inputStyle={{ color: paperTheme.colors.onSurface }}
            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
          />
        </View>

        <View style={{ marginBottom: 8, height: 40 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 16 }}
          >
            {categories.map((category) => (
              <TouchableRipple
                key={category}
                onPress={() => selectCategory(category)}
                style={{ marginRight: 16, justifyContent: "center" }}
              >
                <Text
                  style={{
                    color:
                      selectedCategory === category
                        ? paperTheme.colors.primary
                        : paperTheme.colors.onSurfaceVariant,
                    fontWeight:
                      selectedCategory === category ? "bold" : "normal",
                    textDecorationLine:
                      selectedCategory === category ? "underline" : "none",
                    fontSize: 16,
                    paddingVertical: 4,
                  }}
                >
                  {category}
                </Text>
              </TouchableRipple>
            ))}
          </ScrollView>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          {loading && !refreshing ? (
            <Text style={{ padding: 16, color: paperTheme.colors.onSurface }}>
              Ładowanie...
            </Text>
          ) : filteredPlaces.length === 0 ? (
            <Text
              style={{ padding: 16, color: paperTheme.colors.onSurfaceVariant }}
            >
              {searchQuery || selectedCategory
                ? "Brak wyników wyszukiwania"
                : "Brak dostępnych miejsc"}
            </Text>
          ) : (
            <>
              <FlatList
                data={filteredPlaces}
                renderItem={renderPlaceItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={
                  filteredPlaces.length > 1
                    ? { justifyContent: "space-between" }
                    : { justifyContent: "flex-start" }
                }
                showsVerticalScrollIndicator={true}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                contentContainerStyle={{
                  paddingBottom: Platform.OS === "ios" ? 120 : 110,
                }}
              />
            </>
          )}
        </View>
      </Surface>
    </SafeAreaView>
  );
};

export default HomeScreen;
