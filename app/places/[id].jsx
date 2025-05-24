import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
  Dimensions,
} from "react-native";
import {
  Text,
  Surface,
  Card,
  Button,
  Avatar,
  Divider,
  IconButton,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { useFocusEffect } from "@react-navigation/native";
import { fetchReviewsWithUserData } from "../../services/ReviewService";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const contentWidth = width * 0.95;
const imageWidth = width * 0.9;

const PlaceDetails = () => {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const paperTheme = usePaperTheme();

  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);

  useEffect(() => {
    if (place) {
      router.setParams({ title: place.category });
    }
  }, [place]);

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      console.log("Rozpoczynam ładowanie danych dla miejsca:", id);

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

      if (placeData) {
        setAverageRating(placeData.rating || 0);
        setRatingsCount(placeData.ratings_count || 0);
      }

      console.log("Pobieranie opinii dla miejsca:", id);
      try {
        const reviewsData = await fetchReviewsWithUserData(id);
        console.log(`Pobrano ${reviewsData.length} opinii dla miejsca ${id}`);
        setReviews(reviewsData);
      } catch (reviewsError) {
        console.error("Błąd pobierania opinii:", reviewsError);
        setReviews([]);
      }
    } catch (error) {
      console.error("Error loading place data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          icon={i <= roundedRating ? "star" : "star-outline"}
          size={18}
          iconColor={i <= roundedRating ? "#FFD700" : "#AAAAAA"}
          style={{ margin: 0, padding: 0, width: 20 }}
        />
      );
    }

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {stars}
      </View>
    );
  };

  const openGoogleMaps = () => {
    if (!place?.address) return;

    const address = encodeURIComponent(place.address);

    const mapsUrl = Platform.select({
      default: `https://www.google.com/maps/search/?api=1&query=${address}`,
    });

    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          console.log("Nie można otworzyć Google Maps");
        }
      })
      .catch((err) => {
        console.error("Błąd podczas otwierania Google Maps:", err);
      });
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: paperTheme.colors.background,
      }}
      edges={["top"]}
    >
      <Surface style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          contentInsetAdjustmentBehavior="never"
        >
          {/* Zdjęcie na górze - 90% szerokości */}
          <View style={styles.imageContainer}>
            {place?.image_url && (
              <Card.Cover
                source={{ uri: place.image_url }}
                style={[styles.coverImage, { width: imageWidth }]}
              />
            )}
          </View>

          <View style={[styles.container, { width: contentWidth }]}>
            <View style={styles.headerSection}>
              <View style={styles.leftHeader}>
                <Text variant="titleLarge" style={styles.placeName}>
                  {place?.name}
                </Text>
                <View style={styles.addressContainer}>
                  <IconButton
                    icon="map-marker"
                    size={20}
                    style={styles.addressIcon}
                  />
                  <Text variant="bodyMedium" style={styles.address}>
                    {place?.address}
                  </Text>
                </View>
              </View>

              <View style={styles.rightHeader}>
                <View style={styles.ratingsContainer}>
                  {renderRatingStars(averageRating)}
                  <Text style={styles.ratingsCount}>
                    {ratingsCount}{" "}
                    {ratingsCount === 1
                      ? "ocena"
                      : ratingsCount % 10 >= 2 &&
                          ratingsCount % 10 <= 4 &&
                          (ratingsCount % 100 < 10 || ratingsCount % 100 >= 20)
                        ? "oceny"
                        : "ocen"}
                  </Text>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />
            <Text variant="bodyLarge" style={styles.description}>
              {place?.description}
            </Text>

            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                icon="comment-plus"
                onPress={() =>
                  router.push({
                    pathname: `/places/reviews/${id}`,
                    params: {
                      placeName: place.name,
                      placeAddress: place.address,
                    },
                  })
                }
                style={styles.actionButton}
              >
                Dodaj opinię
              </Button>

              <Button
                mode="contained"
                icon="navigation"
                onPress={openGoogleMaps}
                style={styles.actionButton}
              >
                Nawiguj
              </Button>
            </View>

            <Divider style={styles.divider} />
            <View style={styles.reviewsHeaderContainer}>
              <Text variant="titleLarge" style={styles.reviewsHeader}>
                Opinie ({reviews.length})
              </Text>
              <IconButton
                icon="refresh"
                onPress={loadData}
                loading={refreshing}
                size={24}
              />
            </View>

            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>Brak opinii. Dodaj pierwszą!</Text>
            ) : (
              <View style={styles.reviewsContainer}>
                {reviews.map((review) => (
                  <Card key={review.id} style={styles.reviewCard}>
                    <Card.Content>
                      <View style={styles.reviewHeader}>
                        {review?.user?.user_metadata?.avatar_url ? (
                          <Avatar.Image
                            size={32}
                            source={{
                              uri: review.user.user_metadata.avatar_url,
                            }}
                          />
                        ) : (
                          <Avatar.Text
                            size={32}
                            label={
                              review?.user?.user_metadata?.username
                                ? review.user.user_metadata.username
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "U"
                            }
                          />
                        )}
                        <View style={styles.reviewAuthorContainer}>
                          <Text
                            variant="titleMedium"
                            style={styles.reviewAuthor}
                          >
                            {review?.user?.user_metadata?.username ||
                              "Użytkownik"}
                          </Text>
                          <View style={styles.reviewRatingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <IconButton
                                key={star}
                                icon={
                                  star <= review.rating
                                    ? "star"
                                    : "star-outline"
                                }
                                size={16}
                                iconColor={
                                  star <= review.rating ? "#FFD700" : "#AAAAAA"
                                }
                                style={styles.reviewStar}
                              />
                            ))}
                            <Text variant="bodySmall" style={styles.reviewDate}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text variant="bodyMedium" style={styles.reviewContent}>
                        {review.review}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 0,
  },
  coverImage: {
    height: 220,
    borderRadius: 12,
  },
  container: {
    padding: 16,
    alignSelf: "center",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "flex-start",
    width: "100%",
    marginTop: 8,
  },
  leftHeader: {
    flex: 3,
    paddingRight: 16,
  },
  rightHeader: {
    flex: 2,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  ratingsContainer: {
    alignItems: "flex-end",
  },
  placeName: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 22,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressIcon: {
    margin: 0,
    padding: 0,
  },
  address: {
    flex: 1,
  },
  ratingsCount: {
    marginTop: 4,
    textAlign: "right",
  },
  divider: {
    marginVertical: 16,
    width: "100%",
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  reviewsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  reviewsHeader: {
    fontWeight: "bold",
  },
  noReviews: {
    marginVertical: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  reviewsContainer: {
    width: "100%",
    alignItems: "center",
  },
  reviewCard: {
    marginBottom: 16,
    width: "100%",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAuthorContainer: {
    marginLeft: 12,
    flex: 1,
  },
  reviewAuthor: {
    fontWeight: "bold",
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewStar: {
    margin: 0,
    padding: 0,
    width: 20,
  },
  reviewDate: {
    marginLeft: 8,
  },
  reviewContent: {
    marginTop: 8,
    lineHeight: 20,
  },
});

export default PlaceDetails;
