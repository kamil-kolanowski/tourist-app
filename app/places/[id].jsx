import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Surface,
  Card,
  List,
  IconButton,
  Divider,
  Avatar,
  Chip,
} from "react-native-paper";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { fetchReviewsWithUserData } from "../../services/ReviewService";

const PlaceDetails = () => {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dodajemy nowe stany dla ocen
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);

  // Funkcja do pobierania danych miejsca i opinii
  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      console.log("Rozpoczynam ładowanie danych dla miejsca:", id);

      // Pobierz dane miejsca
      const { data: placeData, error: placeError } = await db
        .from("places")
        .eq("id", id)
        .single();

      if (placeError) {
        console.error("Błąd pobierania miejsca:", placeError);
        throw placeError;
      }

      console.log("Dane miejsca pobrane pomyślnie:", placeData?.name);
      setPlace(placeData);

      // Pobierz wszystkie opinie
      console.log("Pobieranie opinii dla miejsca:", id);
      try {
        const reviewsData = await fetchReviewsWithUserData(id);
        console.log("Pobrano opinii:", reviewsData?.length || 0);
        setReviews(reviewsData || []);

        // Oblicz średnią ocenę z opinii
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating = totalRating / reviewsData.length;
          const roundedRating = Math.round(avgRating * 10) / 10; // Zaokrąglenie do 1 miejsca po przecinku

          console.log(
            "Nowa średnia ocena:",
            roundedRating,
            "z",
            reviewsData.length,
            "opinii"
          );
          setAverageRating(roundedRating);
          setRatingsCount(reviewsData.length);

          // Zaktualizuj dane miejsca z nowymi obliczeniami
          try {
            await db.from("places").eq("id", id).update({
              rating: roundedRating,
              ratings_count: reviewsData.length,
            });
            console.log("Zaktualizowano rating miejsca w bazie danych");
          } catch (updateError) {
            console.error("Błąd podczas aktualizacji oceny:", updateError);
            // Nie przerywamy działania, nawet jeśli aktualizacja się nie powiedzie
          }
        } else {
          console.log("Brak opinii - ustawiam domyślne wartości");
          setAverageRating(0);
          setRatingsCount(0);
        }
      } catch (reviewsError) {
        console.error("Błąd podczas pobierania opinii:", reviewsError);
        // Nawet jeśli wystąpi błąd z opiniami, kontynuujemy wyświetlanie danych miejsca
        setReviews([]);
        setAverageRating(0);
        setRatingsCount(0);
      }
    } catch (error) {
      console.error("Error loading place data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Użyj useFocusEffect zamiast useEffect, aby odświeżyć dane po powrocie na ekran
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Renderowanie gwiazdek na podstawie faktycznej obliczonej oceny
  const renderRatingStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          icon={i <= roundedRating ? "star" : "star-outline"}
          size={20}
          iconColor={i <= roundedRating ? "#FFD700" : "#AAAAAA"}
          style={{ margin: 0, padding: 0 }}
        />
      );
    }

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {stars}
        <Text style={{ marginLeft: 5 }}>
          {averageRating.toFixed(1)} ({ratingsCount})
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Ładowanie...</Text>
      </Surface>
    );
  }

  if (!place) {
    return (
      <Surface
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Nie znaleziono miejsca</Text>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView>
        <Card style={{ margin: 16 }}>
          <Card.Content>
            <Text variant="headlineMedium">{place?.name}</Text>
            <Chip
              icon="tag"
              style={{ marginVertical: 8, alignSelf: "flex-start" }}
            >
              {place?.category}
            </Chip>
            <View style={{ marginVertical: 8 }}>
              {renderRatingStars(averageRating)}
            </View>
            <Divider style={{ marginVertical: 10 }} />
            <Text variant="bodyLarge" style={{ marginTop: 8 }}>
              {place?.description}
            </Text>
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <IconButton icon="map-marker" size={24} />
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {place?.address}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={{ margin: 16 }}>
          <Card.Title
            title={`Opinie (${reviews.length})`}
            right={(props) => (
              <IconButton
                {...props}
                icon="refresh"
                onPress={loadData}
                loading={refreshing}
              />
            )}
          />
          <Card.Content>
            {reviews.length === 0 ? (
              <Text>Brak opinii. Dodaj pierwszą!</Text>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} style={{ marginBottom: 12 }}>
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Avatar.Text
                        size={24}
                        label={
                          review?.user?.user_metadata?.username
                            ? review.user.user_metadata.username
                                .substring(0, 2)
                                .toUpperCase()
                            : "U"
                        }
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text variant="titleMedium">
                          {review?.user?.user_metadata?.username ||
                            "Użytkownik"}
                        </Text>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <IconButton
                              key={star}
                              icon={
                                star <= review.rating ? "star" : "star-outline"
                              }
                              size={16}
                              iconColor={
                                star <= review.rating ? "#FFD700" : "#AAAAAA"
                              }
                              style={{ margin: 0, padding: 0 }}
                            />
                          ))}
                          <Text variant="bodySmall" style={{ marginLeft: 5 }}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text variant="bodyMedium">{review.review}</Text>
                  </Card.Content>
                </Card>
              ))
            )}

            <Button
              mode="contained"
              onPress={() => router.push(`/places/reviews/${id}`)}
              style={{ marginTop: 16 }}
              icon="comment-plus"
            >
              Dodaj opinię
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
};

export default PlaceDetails;
