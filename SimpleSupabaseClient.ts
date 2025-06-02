import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import Constants from "expo-constants";

const SUPABASE_URL =
  Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  Constants.expoConfig?.extra?.SUPABASE_KEY || process.env.SUPABASE_KEY;

type User = {
  id: string;
  email: string;
  user_metadata?: any;
  [key: string]: any;
};

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
};

let currentSession: Session | null = null;
let currentUser: User | null = null;

// Funkcje pomocnicze do zarządzania sesją
const saveSession = async (session: Session | null) => {
  currentSession = session;
  currentUser = session?.user || null;
  if (session) {
    await AsyncStorage.setItem("supabase_session", JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem("supabase_session");
  }
};

const loadSession = async (): Promise<Session | null> => {
  try {
    const storedSession = await AsyncStorage.getItem("supabase_session");
    if (storedSession) {
      const session = JSON.parse(storedSession);

      // Sprawdź czy token nie wygasł
      if (session.expires_at * 1000 > Date.now()) {
        currentSession = session;
        currentUser = session.user;
        return session;
      }

      // Token wygasł, spróbuj odświeżyć
      if (session.refresh_token) {
        const refreshedSession = await refreshSession(session.refresh_token);
        return refreshedSession;
      }
    }
  } catch (e) {
    console.error("Błąd ładowania sesji:", e);
  }
  return null;
};

const refreshSession = async (
  refresh_token: string
): Promise<Session | null> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ refresh_token }),
      }
    );

    if (response.ok) {
      const session = await response.json();
      await saveSession(session);
      return session;
    }
  } catch (error) {
    console.error("Exception podczas odświeżania sesji:", error);
  }
  await saveSession(null);
  return null;
};

// Nagłówki do zapytań
const getAuthHeaders = async () => {
  const session = currentSession || (await loadSession());
  const headers = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    Authorization: session
      ? `Bearer ${session.access_token}`
      : `Bearer ${SUPABASE_KEY}`,
  };
  return headers;
};

// Nowa funkcja do sprawdzania stanu logowania
const getAuthState = async () => {
  const session = currentSession || (await loadSession());
  return session;
};

// Implementacja klienta auth
export const auth = {
  // Rejestracja użytkownika
  signUp: async (
    email: string,
    password: string,
    meta?: { username?: string; avatar_url?: string }
  ) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            email_confirm: true,
            username: meta?.username || email.split("@")[0],
            avatar_url: meta?.avatar_url || null,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          error: {
            message: data.error_description || data.error || "Błąd rejestracji",
          },
        };
      }

      const loginResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        await saveSession(loginData);
      }

      return { error: null };
    } catch (error: any) {
      console.error("Błąd podczas rejestracji:", error);
      return { error: { message: error.message || "Nieznany błąd" } };
    }
  },

  // Logowanie
  signInWithPassword: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      try {
        await fetch("https://www.google.com", {
          method: "HEAD",
          timeout: 5000,
        });
      } catch (netError) {
        return { error: { message: "Sprawdź połączenie z internetem" } };
      }

      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { error: { message: "Błąd formatu odpowiedzi serwera" } };
      }

      if (!response.ok) {
        return {
          error: {
            message: data.error_description || data.error || "Błąd logowania",
          },
        };
      }

      if (data.access_token) {
        await saveSession(data);
      } else {
        return { error: { message: "Nieprawidłowa odpowiedź serwera" } };
      }

      return { error: null };
    } catch (error: any) {
      console.error(error);
      return { error: { message: error.message || "Nieznany błąd" } };
    }
  },

  // Wylogowanie
  signOut: async () => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers,
      });

      await saveSession(null);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "Błąd wylogowania" } };
    }
  },

  // Odzyskiwanie hasła
  resetPasswordForEmail: async (email: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          error: {
            message:
              error.error_description ||
              error.error ||
              "Błąd resetowania hasła",
          },
        };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "Nieznany błąd" } };
    }
  },

  // Aktualizacja danych użytkownika
  updateUser: async ({ data }: { data: any }) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          error: {
            message:
              error.error_description ||
              error.error ||
              "Błąd aktualizacji użytkownika",
          },
        };
      }

      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers,
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (currentSession) {
          currentSession.user = userData;
          await saveSession(currentSession);
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "Nieznany błąd" } };
    }
  },

  // Pobierz aktualną sesję
  getSession: async () => {
    const session = await getAuthState();
    return { data: { session } };
  },

  // Pobierz aktualnego użytkownika
  getUser: async () => {
    const session = currentSession || (await loadSession());
    return { data: { user: session?.user || null } };
  },

  // Nasłuchuj zmian sesji
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void
  ) => {
    loadSession().then((session) => {
      if (session) {
        callback("SIGNED_IN", session);
      } else {
        callback("SIGNED_OUT", null);
      }
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

// Klient bazy danych
export const db = {
  from: (table: string) => ({
    select: async (columns = "*") => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`,
          {
            headers,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return { data: null, error };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    insert: async (values: any[]) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          return { data: null, error };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    eq: (column: string, value: any) => ({
      single: async () => {
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}&limit=1`,
            { headers }
          );

          if (!response.ok) {
            console.error(response.statusText);
            return { data: null, error: { message: response.statusText } };
          }

          const data = await response.json();
          return { data: data[0] || null, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      select: async (selectColumns = "*") => {
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}&select=${selectColumns}`,
            { headers }
          );

          if (!response.ok) {
            console.error(response.statusText);
            return { data: null, error: { message: response.statusText } };
          }

          const data = await response.json();
          return {
            data,
            error: null,
            single: () => {
              return { data: data[0] || null, error: null };
            },
            order: (column: string, { ascending = true } = {}) => {},
          };
        } catch (error) {
          return { data: null, error };
        }
      },
    }),
  }),
};

// Implementacja klienta storage
export const storage = {
  from: (bucket: string) => ({
    upload: async (path: string, data: any, options = {}) => {
      try {
        const headers = await getAuthHeaders();
        const reqHeaders = { ...headers };
        delete reqHeaders["Content-Type"];

        const formData = new FormData();
        if (data.type && data.uri) {
          formData.append("file", data);
        } else {
          const blob = new Blob([data], {
            type: options.contentType || "application/octet-stream",
          });
          formData.append("file", blob);
        }

        const response = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
          {
            method: "POST",
            headers: {
              ...reqHeaders,
              ...options,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(error);
          return { data: null, error };
        }

        const responseData = await response.json();
        return { data: responseData, error: null };
      } catch (error) {
        console.error(error);
        return { data: null, error };
      }
    },

    getPublicUrl: (path: string) => {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
      return { data: { publicUrl } };
    },

    remove: async (paths: string[]) => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}`,
          {
            method: "DELETE",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(paths),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return { data: null, error };
        }

        return { data: {}, error: null };
      } catch (error) {
        console.error(error);
        return { data: null, error };
      }
    },
  }),
};

export const supabase = {
  auth,
  db,
  storage,
  from: db.from,
};
