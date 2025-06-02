import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import {
  Text,
  Avatar,
  Button,
  Surface,
  Card,
  useTheme as usePaperTheme,
  Divider,
} from "react-native-paper";
import { router } from "expo-router";
import { db } from "../../SimpleSupabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [lastVisitedPlace, setLastVisitedPlace] = useState(null);
  const { user, signOut, isAuthenticated } = useAuth();
  const paperTheme = usePaperTheme();
  const { isDarkTheme } = useTheme();

  const getThemeColors = () => {
    return {
      cardBackgroundColor: isDarkTheme ? "#333333" : "#E0E0E0",
      placeholderBackgroundColor: isDarkTheme ? "#555555" : "#BDBDBD",
      placeholderTextColor: isDarkTheme ? "#AAAAAA" : "#757575",
      textColor: isDarkTheme ? "#FFFFFF" : "#000000",
      secondaryTextColor: isDarkTheme ? "#CCCCCC" : "rgba(0, 0, 0, 0.7)",
      logoutButtonColor: "#f44336",
    };
  };

  const colors = getThemeColors();

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await db
        .from("profiles")
        .eq("id", user.id)
        .select("*");

      if (error) throw error;
      if (data && data.length > 0) {
        setUserProfile(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserReviewsCount = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await db
        .from("reviews")
        .eq("user_id", user.id)
        .select("id");

      if (error) throw error;
      if (data) {
        setReviewsCount(data.length);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLastVisitedPlace = async () => {
    try {
      if (!user?.id) return;

      const headers = {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs",
        "Content-Type": "application/json",
        Authorization: user?.id
          ? `Bearer ${user.id}`
          : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs`,
      };

      const { data: reviewsData, error: reviewError } = await db
        .from("reviews")
        .eq("user_id", user.id)
        .select("*");

      if (reviewError) throw reviewError;

      if (reviewsData && reviewsData.length > 0) {
        const sortedReviews = [...reviewsData].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const lastReview = sortedReviews[0];

        const { data: placeData, error: placeError } = await db
          .from("places")
          .eq("id", lastReview.place_id)
          .select("*");

        if (placeError) throw placeError;

        if (placeData && placeData.length > 0) {
          setLastVisitedPlace(placeData[0]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (user?.id) {
      const loadUserData = async () => {
        setLoading(true);
        await fetchUserProfile();
        await fetchUserReviewsCount();
        await fetchLastVisitedPlace();
        setLoading(false);
      };

      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated || !user) {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 300);

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: paperTheme.colors.background,
        }}
        edges={["top"]}
      >
        <Text>Nie jesteś zalogowany</Text>
        <Button
          mode="contained"
          onPress={() => router.replace("/auth/login")}
          style={{ marginTop: 20 }}
        >
          Zaloguj się
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      edges={["top"]}
    >
      <Surface
        style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      >
        <ScrollView style={styles.container}>
          <Text variant="headlineMedium" style={styles.header}>
            Twój profil
          </Text>

          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={80}
                  source={{
                    uri:
                      userProfile?.avatar_url ||
                      user?.user_metadata?.avatar_url ||
                      "https://via.placeholder.com/150",
                  }}
                />
              </View>

              <View style={styles.userInfoContainer}>
                <Text variant="titleLarge" style={styles.username}>
                  {userProfile?.username ||
                    user?.user_metadata?.username ||
                    "Użytkownik"}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email}
                </Text>
                <Text variant="bodyMedium" style={styles.reviewsCount}>
                  Liczba opinii: {reviewsCount}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: colors.textColor }]}
          >
            Ostatnio odwiedzone miejsce
          </Text>

          {lastVisitedPlace ? (
            <View style={styles.cardWrapper}>
              <Card
                style={[
                  styles.lastPlaceCard,
                  { backgroundColor: colors.cardBackgroundColor },
                ]}
                onPress={() => router.push(`/places/${lastVisitedPlace.id}`)}
              >
                <View style={styles.cardInnerWrapper}>
                  <View style={styles.lastPlaceImageContainer}>
                    {lastVisitedPlace.image_url ? (
                      <Image
                        source={{ uri: lastVisitedPlace.image_url }}
                        style={styles.lastPlaceImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.lastPlacePlaceholder,
                          {
                            backgroundColor: colors.placeholderBackgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.lastPlacePlaceholderText,
                            { color: colors.placeholderTextColor },
                          ]}
                        >
                          Brak zdjęcia
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.lastPlaceInfo}>
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.lastPlaceName,
                        { color: colors.textColor },
                      ]}
                    >
                      {lastVisitedPlace.name}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.lastPlaceAddress,
                        { color: colors.secondaryTextColor },
                      ]}
                    >
                      {lastVisitedPlace.address}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          ) : (
            <Card
              style={[
                styles.emptyPlaceCard,
                { backgroundColor: colors.cardBackgroundColor },
              ]}
            >
              <Card.Content>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.emptyPlaceText,
                    { color: colors.secondaryTextColor },
                  ]}
                >
                  Nie odwiedziłeś jeszcze żadnego miejsca
                </Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
          >
            Wyloguj się
          </Button>
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  profileCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 4,
    opacity: 0.7,
  },
  reviewsCount: {
    fontWeight: "500",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 24,
    borderRadius: 20,
  },
  lastPlaceCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardInnerWrapper: {
    flexDirection: "row",
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 20,
  },
  lastPlaceImageContainer: {
    width: 100,
    height: 100,
    margin: 12,
  },
  lastPlaceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: "cover",
  },
  lastPlacePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lastPlacePlaceholderText: {
    fontSize: 12,
  },
  lastPlaceInfo: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
    paddingVertical: 16,
  },
  lastPlaceName: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  lastPlaceAddress: {},
  emptyPlaceCard: {
    marginBottom: 24,
    borderRadius: 20,
  },
  emptyPlaceText: {
    textAlign: "center",
    padding: 24,
  },
  logoutButton: {
    marginBottom: 40,
    backgroundColor: "#f44336",
    borderRadius: 12,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default Profile;
