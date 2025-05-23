import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Surface,
  Card,
  useTheme,
  IconButton,
  Divider, // Dodany import komponentu Divider
} from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../SimpleSupabaseClient";
import { addReviewAndUpdateRating } from "../../../services/ReviewService";

const AddReview = () => {
  const { id, placeName, placeAddress } = useLocalSearchParams();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState(null);
  const { user } = useAuth();
  const theme = useTheme();

  // Pobierz dane miejsca jeśli nie zostały przekazane jako parametry
  useEffect(() => {
    const fetchPlaceInfo = async () => {
      if (!placeName || !placeAddress) {
        try {
          const { data, error } = await db.from("places").eq("id", id).single();

          if (data && !error) {
            setPlace(data);
          }
        } catch (error) {
          console.error("Błąd pobierania informacji o miejscu:", error);
        }
      }
    };

    fetchPlaceInfo();
  }, [id, placeName, placeAddress]);

  const handleSubmit = async () => {
    if (!user) {
      alert("Musisz być zalogowany, aby dodać opinię");
      return;
    }

    setLoading(true);
    try {
      // Użyj nowej funkcji do dodania recenzji i aktualizacji ocen
      await addReviewAndUpdateRating(id, user.id, rating, review);

      // Sukces - wróć do szczegółów miejsca z parametrem do odświeżenia
      router.replace({
        pathname: `/places/${id}`,
        params: { refresh: Date.now() },
      });
    } catch (error) {
      console.error("Błąd dodawania opinii:", error);
      alert("Wystąpił błąd podczas dodawania opinii");
    } finally {
      setLoading(false);
    }
  };

  // Renderowanie gwiazdek do wyboru oceny
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconButton
            key={star}
            icon={star <= rating ? "star" : "star-outline"}
            iconColor={star <= rating ? "#FFD700" : "#AAAAAA"}
            size={40}
            onPress={() => setRating(star)}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const displayName = placeName || place?.name || "miejsce";
  const displayAddress = placeAddress || place?.address || "";

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Surface style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Card style={styles.card}>
              <Card.Content>
                {/* Nazwa miejsca i adres na górze */}
                <Text variant="headlineSmall" style={styles.placeName}>
                  {displayName}
                </Text>
                {displayAddress && (
                  <Text variant="bodyMedium" style={styles.placeAddress}>
                    {displayAddress}
                  </Text>
                )}

                <Divider style={styles.divider} />

                {/* Ocena - klikanie gwiazdek */}
                <Text variant="titleMedium" style={styles.ratingLabel}>
                  Twoja ocena:
                </Text>
                {renderStars()}

                {/* Pole na komentarz */}
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  label="Twój komentarz"
                  value={review}
                  onChangeText={setReview}
                  style={styles.input}
                />

                {/* Przycisk dodania opinii */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                >
                  Dodaj opinię
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    marginBottom: 20,
  },
  placeName: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  placeAddress: {
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  ratingLabel: {
    marginBottom: 12,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  starIcon: {
    margin: 4,
  },
  input: {
    marginBottom: 24,
    height: 120,
  },
  submitButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
});

export default AddReview;
