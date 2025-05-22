import { db } from "../SimpleSupabaseClient";

// Pobieranie wszystkich atrakcji
export const fetchAttractions = async () => {
  const { data, error } = await db.from("attractions").select("*");

  if (error) throw error;
  return data;
};

// Pobieranie jednej atrakcji
export const fetchAttraction = async (id: string) => {
  const { data, error } = await db.from("attractions").eq("id", id).single();

  if (error) throw error;
  return data;
};

// Dodawanie atrakcji
export const addAttraction = async (attraction: any) => {
  const { data, error } = await db.from("attractions").insert([attraction]);

  if (error) throw error;
  return data[0];
};

// Aktualizacja atrakcji
export const updateAttraction = async (id: string, updates: any) => {
  const { data, error } = await db
    .from("attractions")
    .eq("id", id)
    .update(updates)
    .select();

  if (error) throw error;
  return data[0];
};

// Usuwanie atrakcji
export const deleteAttraction = async (id: string) => {
  const { error } = await db.from("attractions").eq("id", id).delete();

  if (error) throw error;
};

// Pobieranie ulubionych atrakcji użytkownika
export const fetchFavorites = async (userId: string) => {
  const { data, error } = await db
    .from("user_favorites")
    .eq("user_id", userId)
    .select("*, attractions(*)");

  if (error) throw error;
  return data;
};

// Dodawanie do ulubionych
export const addToFavorites = async (userId: string, attractionId: string) => {
  const { data, error } = await db
    .from("user_favorites")
    .insert([{ user_id: userId, attraction_id: attractionId }]);

  if (error) throw error;
  return data[0];
};

// Usuwanie z ulubionych
export const removeFromFavorites = async (
  userId: string,
  attractionId: string
) => {
  const { error } = await db
    .from("user_favorites")
    .eq("user_id", userId)
    .eq("attraction_id", attractionId)
    .delete();

  if (error) throw error;
};
