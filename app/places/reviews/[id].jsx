import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Surface, Card } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { auth, db } from "../../../FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddReview() {
  const { id } = useLocalSearchParams();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");

  const handleSubmit = async () => {
    try {
      const reviewData = {
        placeId: id,
        userId: auth.currentUser.uid,
        rating,
        review,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "reviews"), reviewData);
      router.back();
    } catch (error) {
      console.error("Error adding review:", error);
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

          <Button mode="contained" onPress={handleSubmit}>
            Zapisz opinię
          </Button>
        </Card.Content>
      </Card>
    </Surface>
  );
}
