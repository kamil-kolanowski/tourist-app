import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

const SUPABASE_URL = "https://lxduypbtgbwmkcrqvduv.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs";

// Typy dla TypeScript
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

// Globalne zmienne dla sesji i użytkownika
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
      console.log("Znaleziono zapisaną sesję");
      const session = JSON.parse(storedSession);

      // Sprawdź czy token nie wygasł
      if (session.expires_at * 1000 > Date.now()) {
        console.log("Sesja jest wciąż aktywna, użytkownik:", session.user?.id);
        currentSession = session;
        currentUser = session.user;
        return session;
      } else {
        console.log("Sesja wygasła, próba odświeżenia");
      }

      // Token wygasł, spróbuj odświeżyć
      if (session.refresh_token) {
        const refreshedSession = await refreshSession(session.refresh_token);
        return refreshedSession;
      } else {
        console.log("Brak refresh_token, nie można odświeżyć sesji");
      }
    } else {
      console.log("Brak zapisanej sesji");
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
    console.log("Próba odświeżenia tokenu");
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
      console.log("Token odświeżony pomyślnie");
      await saveSession(session);
      return session;
    } else {
      console.log("Błąd odświeżenia tokenu:", await response.text());
    }
  } catch (error) {
    console.error("Exception podczas odświeżania sesji:", error);
  }

  // Jeśli odświeżanie nie powiodło się, wyczyść sesję
  console.log("Czyszczenie sesji po nieudanym odświeżeniu");
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
  console.log(
    "Aktualny stan sesji:",
    session
      ? {
          isLoggedIn: true,
          userId: session.user?.id,
          email: session.user?.email,
          expires: new Date(session.expires_at * 1000).toLocaleString(),
        }
      : "Brak sesji"
  );
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
      console.log("Rozpoczynam rejestrację dla:", email, "z metadanymi:", meta);

      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          // Dodaj metadane oraz wyłącz wymaganie potwierdzenia emaila
          data: {
            email_confirm: true,
            username: meta?.username || email.split("@")[0],
            avatar_url: meta?.avatar_url || null,
          },
        }),
      });

      const data = await response.json();
      console.log("Odpowiedź rejestracji:", response.ok ? "OK" : "Błąd", data);

      if (!response.ok) {
        return {
          error: {
            message: data.error_description || data.error || "Błąd rejestracji",
          },
        };
      }

      // Po udanej rejestracji, od razu zaloguj użytkownika
      console.log("Pomyślna rejestracja, próba logowania");
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
        console.log("Zalogowano po rejestracji");
        await saveSession(loginData);
      } else {
        console.log("Nie udało się zalogować po rejestracji");
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
      console.log("Rozpoczynam logowanie dla:", email);

      // Sprawdź połączenie sieciowe przed wysłaniem żądania
      try {
        const networkTest = await fetch("https://www.google.com", {
          method: "HEAD",
          timeout: 5000,
        });
        console.log("Test sieci:", networkTest.ok ? "OK" : "Błąd");
      } catch (netError) {
        console.error("Problem z połączeniem internetowym:", netError);
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
      console.log("Odpowiedź serwera (text):", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Odpowiedź nie jest w formacie JSON");
        return { error: { message: "Błąd formatu odpowiedzi serwera" } };
      }

      if (!response.ok) {
        console.error("Błąd logowania:", data);
        return {
          error: {
            message: data.error_description || data.error || "Błąd logowania",
          },
        };
      }

      if (data.access_token) {
        console.log("Logowanie zakończone sukcesem, zapisuję sesję");
        await saveSession(data);
      } else {
        console.error("Brak tokenu w odpowiedzi:", data);
        return { error: { message: "Nieprawidłowa odpowiedź serwera" } };
      }

      return { error: null };
    } catch (error: any) {
      console.error("Wyjątek podczas logowania:", error);
      return { error: { message: error.message || "Nieznany błąd" } };
    }
  },

  // Wylogowanie
  signOut: async () => {
    try {
      // Wykonaj zapytanie do wylogowania
      const headers = await getAuthHeaders();
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers,
      });

      // Wyczyść lokalną sesję
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

      // Odśwież dane użytkownika
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
    // Sprawdź stan na początku
    loadSession().then((session) => {
      if (session) {
        callback("SIGNED_IN", session);
      } else {
        callback("SIGNED_OUT", null);
      }
    });

    // Brak prawdziwego nasłuchiwania w prostej implementacji
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

// Implementacja klienta bazy danych
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
        console.error(`Select error for ${table}:`, error);
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
        console.error(`Insert error for ${table}:`, error);
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
            const error = await response.json();
            return { data: null, error };
          }

          const data = await response.json();
          return { data: data[0] || null, error: null };
        } catch (error) {
          console.error(`Single query error for ${table}:`, error);
          return { data: null, error };
        }
      },

      update: (updates: any) => ({
        select: async () => {
          try {
            const headers = await getAuthHeaders();
            const response = await fetch(
              `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
              {
                method: "PATCH",
                headers: { ...headers, Prefer: "return=representation" },
                body: JSON.stringify(updates),
              }
            );

            if (!response.ok) {
              const error = await response.json();
              return { data: null, error };
            }

            const data = await response.json();
            return { data, error: null };
          } catch (error) {
            console.error(`Update error for ${table}:`, error);
            return { data: null, error };
          }
        },
      }),

      delete: async () => {
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
            {
              method: "DELETE",
              headers,
            }
          );

          if (!response.ok) {
            const error = await response.json();
            return { error };
          }

          return { error: null };
        } catch (error) {
          console.error(`Delete error for ${table}:`, error);
          return { error };
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
            const errorText = await response.text();
            console.error(
              `Error fetching ${table}:`,
              response.status,
              errorText
            );
            try {
              const errorJson = JSON.parse(errorText);
              return { data: null, error: errorJson };
            } catch (e) {
              return { data: null, error: { message: errorText } };
            }
          }

          const data = await response.json();
          return {
            data,
            error: null,
            // Dodajemy funkcję order do zwróconego obiektu
            order: (column: string, { ascending = true } = {}) => {
              // Sortowanie po stronie klienta
              const sortedData = [...data].sort((a, b) => {
                const valueA = a[column];
                const valueB = b[column];

                if (ascending) {
                  return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                } else {
                  return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                }
              });

              return { data: sortedData, error: null };
            },
          };
        } catch (error) {
          console.error(`Select with eq error for ${table}:`, error);
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
        // Usuwamy Content-Type, ponieważ FormData ustawia własny boundary
        const reqHeaders = { ...headers };
        delete reqHeaders["Content-Type"];

        const formData = new FormData();
        // W React Native musimy użyć specjalnego formatu dla plików
        if (data.type && data.uri) {
          // Dla obiektów File z expo-file-system
          formData.append("file", data);
        } else {
          // Dla ArrayBuffer lub innych typów danych
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
          console.error("Upload error:", error);
          return { data: null, error };
        }

        const responseData = await response.json();
        return { data: responseData, error: null };
      } catch (error) {
        console.error(`Upload error for ${bucket}/${path}:`, error);
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
        console.error(`Remove error for ${bucket}:`, error);
        return { data: null, error };
      }
    },
  }),
};

// Eksportuj klienta
export const supabase = {
  auth,
  db,
  storage,
  from: db.from,
};
