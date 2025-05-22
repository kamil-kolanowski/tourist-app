import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Surface, Card } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
// Zaimportuj nową usługę
import { addReviewAndUpdateRating } from "../../../services/ReviewService";

const AddReview = () => {
  const { id } = useLocalSearchParams();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  return (
    <Surface style={{ flex: 1 }}>
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
            Dodaj opinię
          </Text>

          <View style={{ alignItems: "center", marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                mode={rating >= star ? "contained" : "outlined"}
                onPress={() => setRating(star)}
                style={{ margin: 4 }}
              >
                {star}
              </Button>
            ))}
          </View>

          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            label="Twoja opinia"
            value={review}
            onChangeText={setReview}
            style={{ marginBottom: 16 }}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Zapisz opinię
          </Button>
        </Card.Content>
      </Card>
    </Surface>
  );
};

export default AddReview;
