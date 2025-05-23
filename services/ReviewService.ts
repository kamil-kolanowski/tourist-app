import { db } from "../SimpleSupabaseClient";

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  user?: {
    email: string;
    user_metadata?: {
      username?: string;
      avatar_url?: string;
    };
  };
}

// Pobieranie wszystkich opinii dla danego miejsca
export const fetchReviewsWithUserData = async (
  placeId: string
): Promise<Review[]> => {
  try {
    // Najpierw pobierz wszystkie opinie dla danego miejsca
    const { data: reviews, error } = await db
      .from("reviews")
      .eq("place_id", placeId)
      .select("*");

    if (error) throw error;
    if (!reviews || reviews.length === 0) return [];

    // Posortuj recenzje ręcznie po stronie klienta - najnowsze na górze
    const sortedReviews = [...reviews].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pobierz dane użytkowników dla każdej opinii
    const enhancedReviews = await Promise.all(
      sortedReviews.map(async (review: Review) => {
        try {
          // Poprawiona kolejność wywołań dla SimpleSupabaseClient
          const { data: profileData, error: profileError } = await db
            .from("profiles")
            .eq("id", review.user_id)
            .select("*");

          // Sprawdź, czy mamy wynik
          if (profileData && profileData.length > 0 && !profileError) {
            const profile = profileData[0];
            console.log(`Profil użytkownika dla recenzji ${review.id}:`, {
              username: profile.username,
              hasAvatar: !!profile.avatar_url,
            });

            return {
              ...review,
              user: {
                email: "użytkownik",
                user_metadata: {
                  username: profile.username || "Użytkownik",
                  avatar_url: profile.avatar_url || null,
                },
              },
            };
          }

          // Jeśli nie znaleziono profilu, użyj domyślnych wartości
          console.log(`Brak profilu dla recenzji ${review.id}`);
          return {
            ...review,
            user: {
              email: "użytkownik",
              user_metadata: {
                username: "Użytkownik",
              },
            },
          };
        } catch (error) {
          console.error("Błąd pobierania danych użytkownika:", error);
          return {
            ...review,
            user: {
              email: "użytkownik",
              user_metadata: {
                username: "Użytkownik",
              },
            },
          };
        }
      })
    );

    return enhancedReviews;
  } catch (error) {
    console.error("Error fetching reviews with user data:", error);
    throw error;
  }
};

// Funkcja do dodania opinii i aktualizacji średniej oceny
export const addReviewAndUpdateRating = async (
  placeId: string,
  userId: string,
  rating: number,
  review: string
): Promise<Review> => {
  try {
    // 1. Dodaj nową opinię
    const reviewData = {
      place_id: placeId,
      user_id: userId,
      rating,
      review,
      created_at: new Date().toISOString(),
    };

    const { data: insertedReview, error: reviewError } = await db
      .from("reviews")
      .insert([reviewData]);

    if (reviewError) throw reviewError;

    // 2. Pobierz wszystkie opinie dla tego miejsca
    const { data: reviews, error: fetchError } = await db
      .from("reviews")
      .eq("place_id", placeId)
      .select("rating");

    if (fetchError) throw fetchError;

    // 3. Oblicz nową średnią ocenę
    const ratingsCount = reviews.length;
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = Math.round((totalRating / ratingsCount) * 10) / 10;

    // 4. Zaktualizuj dane miejsca - UŻYJ BEZPOŚREDNIO API ZAMIAST METODY UPDATE
    try {
      const headers = await getAuthHeaders(); // Zdefiniuj tę funkcję lub użyj istniejącej z SimpleSupabaseClient
      const updateResponse = await fetch(
        `https://lxduypbtgbwmkcrqvduv.supabase.co/rest/v1/places?id=eq.${placeId}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            rating: averageRating,
            ratings_count: ratingsCount,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Błąd aktualizacji miejsca: ${errorText}`);
      }
    } catch (updateError) {
      console.error("Błąd aktualizacji miejsca:", updateError);
      throw updateError;
    }

    // 5. Zwróć nowo dodaną opinię wraz z danymi użytkownika
    const addedReview =
      insertedReview && insertedReview.length > 0
        ? insertedReview[0]
        : reviewData;

    // Pobierz dane użytkownika dla nowej opinii
    try {
      // Poprawiona kolejność wywołań
      const { data: profilesData, error: profileError } = await db
        .from("profiles")
        .eq("id", userId)
        .select("username, avatar_url");

      if (profilesData && profilesData.length > 0 && !profileError) {
        const profile = profilesData[0];
        return {
          ...addedReview,
          user: {
            email: "użytkownik",
            user_metadata: {
              username: profile.username || "Użytkownik",
              avatar_url: profile.avatar_url || null,
            },
          },
        };
      }

      return {
        ...addedReview,
        user: {
          email: "użytkownik",
          user_metadata: {
            username: "Użytkownik",
          },
        },
      };
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
      return {
        ...addedReview,
        user: {
          email: "użytkownik",
          user_metadata: {
            username: "Użytkownik",
          },
        },
      };
    }
  } catch (error) {
    console.error("Error adding review and updating rating:", error);
    throw error;
  }
};

// Pomocnicza funkcja do pobierania nagłówków autoryzacji
const getAuthHeaders = async () => {
  // Pobierz token sesji z AsyncStorage
  let sessionData = null;
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const storedSession = await AsyncStorage.getItem("supabase_session");
    if (storedSession) {
      sessionData = JSON.parse(storedSession);
    }
  } catch (e) {
    console.error("Błąd ładowania sesji:", e);
  }

  // Utwórz nagłówki autoryzacji
  const headers = {
    apikey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs",
    Authorization: sessionData?.access_token
      ? `Bearer ${sessionData.access_token}`
      : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs`,
  };

  return headers;
};
