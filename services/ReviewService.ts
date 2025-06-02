import { db } from "../SimpleSupabaseClient";
import Constants from "expo-constants";

const SUPABASE_KEY =
  Constants.expoConfig?.extra?.SUPABASE_KEY || process.env.SUPABASE_KEY;

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

// Pobieranie wszystkich opinii dla miejsca
export const fetchReviewsWithUserData = async (
  placeId: string
): Promise<Review[]> => {
  try {
    const { data: reviews, error } = await db
      .from("reviews")
      .eq("place_id", placeId)
      .select("*");

    if (error) throw error;
    if (!reviews || reviews.length === 0) return [];

    const sortedReviews = [...reviews].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const enhancedReviews = await Promise.all(
      sortedReviews.map(async (review: Review) => {
        try {
          const { data: profileData, error: profileError } = await db
            .from("profiles")
            .eq("id", review.user_id)
            .select("*");

          if (profileData && profileData.length > 0 && !profileError) {
            const profile = profileData[0];

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
          console.error(error);
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
    console.error(error);
    throw error;
  }
};

// Doddanie opinii i aktualizacji średniej oceny
export const addReviewAndUpdateRating = async (
  placeId: string,
  userId: string,
  rating: number,
  review: string
): Promise<Review> => {
  try {
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

    const { data: reviews, error: fetchError } = await db
      .from("reviews")
      .eq("place_id", placeId)
      .select("rating");

    if (fetchError) throw fetchError;

    const ratingsCount = reviews.length;
    const totalRating = reviews.reduce(
      (sum: any, rev: any) => sum + rev.rating,
      0
    );
    const averageRating = Math.round((totalRating / ratingsCount) * 10) / 10;

    try {
      const headers = await getAuthHeaders();
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
      throw updateError;
    }

    const addedReview =
      insertedReview && insertedReview.length > 0
        ? insertedReview[0]
        : reviewData;

    try {
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
      console.error(error);
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
    console.error(error);
    throw error;
  }
};

// Pomocnicza funkcja do pobierania nagłówków autoryzacji
const getAuthHeaders = async () => {
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
    console.error(e);
  }

  // nagłówki autoryzacji
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: sessionData?.access_token
      ? `Bearer ${sessionData.access_token}`
      : `Bearer ${SUPABASE_KEY}`,
  };

  return headers;
};
