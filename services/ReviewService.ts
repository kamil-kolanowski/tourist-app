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
    };
  };
}

// Pobieranie wszystkich opinii dla danego miejsca
export const fetchReviewsWithUserData = async (
  placeId: string
): Promise<Review[]> => {
  try {
    // Najpierw pobierz wszystkie opinie dla danego miejsca - bez użycia order()
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
          // Najpierw pobierz dane z tabeli profiles
          const { data: profilesData } = await db
            .from("profiles")
            .eq("id", review.user_id)
            .select("username");

          // Sprawdź, czy mamy wynik
          if (profilesData && profilesData.length > 0) {
            const profile = profilesData[0];
            return {
              ...review,
              user: {
                email: "użytkownik", // Nie używamy już email z profiles
                user_metadata: {
                  username: profile.username || "Użytkownik",
                },
              },
            };
          }

          // Jeśli nie znaleziono profilu, użyj domyślnych wartości
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

    // 4. Zaktualizuj dane miejsca
    const { error: updateError } = await db
      .from("places")
      .eq("id", placeId)
      .update({
        rating: averageRating,
        ratings_count: ratingsCount,
      });

    if (updateError) throw updateError;

    // 5. Zwróć nowo dodaną opinię wraz z danymi użytkownika
    const addedReview =
      insertedReview && insertedReview.length > 0
        ? insertedReview[0]
        : reviewData;

    // Pobierz dane użytkownika dla nowej opinii
    try {
      const { data: profilesData } = await db
        .from("profiles")
        .eq("id", userId)
        .select("username");

      if (profilesData && profilesData.length > 0) {
        const profile = profilesData[0];
        return {
          ...addedReview,
          user: {
            email: "użytkownik",
            user_metadata: {
              username: profile.username || "Użytkownik",
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
