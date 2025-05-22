import { auth } from "../SimpleSupabaseClient";

// Rejestracja użytkownika
export const registerUser = async (email: string, password: string) => {
  const { error } = await auth.signUp(email, password);
  if (error) throw error;

  const { data } = await auth.getSession();
  return data;
};

// Logowanie
export const loginUser = async (email: string, password: string) => {
  const { error } = await auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data } = await auth.getSession();
  return data;
};

// Wylogowanie
export const logoutUser = async () => {
  const { error } = await auth.signOut();
  if (error) throw error;
};

// Pobieranie aktualnego użytkownika
export const getCurrentUser = async () => {
  const { data } = await auth.getUser();
  if (!data.user) throw new Error("Użytkownik nie jest zalogowany");
  return data.user;
};
