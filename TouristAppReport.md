# Tourist App – Sprawozdanie

## 1. Wprowadzenie

Aplikacja Tourist App to mobilna aplikacja do przeglądania, wyszukiwania i oceniania atrakcji turystycznych. Pozwala użytkownikom na rejestrację, logowanie, dodawanie miejsc, przeglądanie szczegółów, wystawianie opinii oraz personalizację motywu.

---

## 1a. Spełnione wymagania projektowe

### Technologie

- **React Native** – nowoczesny framework do budowy aplikacji mobilnych na Android i iOS (alternatywa dla Kotlin/Java/Swift)
- **Material Design 3** – interfejs użytkownika oparty na najnowszych wytycznych Material 3 (react-native-paper)
- **Supabase** – baza danych (odpowiednik SQLite/RoomDatabase) oraz storage w chmurze
- **Expo** – narzędzia do budowy, testowania i wdrażania aplikacji

### Zrealizowane zagadnienia z listy projektowej

1. **Interfejs użytkownika w całości oparty na Material Design 3**
   - Cała aplikacja korzysta z komponentów react-native-paper, które implementują Material 3 (np. przyciski, karty, przełączniki, nawigacja).
2. **Baza danych (Supabase jako odpowiednik SQLite/RoomDatabase)**
   - Wszystkie dane (miejsca, recenzje, użytkownicy) przechowywane są w chmurowej bazie danych Supabase, z obsługą relacji i zapytań SQL.
3. **Dostęp do dysku w chmurze (Storage Access Framework)**
   - Przesyłanie i pobieranie zdjęć miejsc oraz profili użytkowników realizowane jest przez Supabase Storage (odpowiednik chmurowego dysku).
4. **Aplikacja zbudowana w architekturze klient-serwer (dwu- lub trzywarstwowej)**
   - Frontend (React Native) komunikuje się z backendem (Supabase) przez API, rozdzielając warstwę prezentacji i danych.
5. **Zastosowanie bezpiecznych mechanizmów identyfikacji i uwierzytelniania**
   - Logowanie, rejestracja i autoryzacja użytkowników realizowane są przez bezpieczne mechanizmy Supabase Auth.
6. **Nawigacja z grafami (expo-router, Stack.Screen)**
   - Nawigacja w aplikacji oparta jest na stackach i tabach (`expo-router`, `Stack.Screen`), co odpowiada grafom nawigacji Android Navigation Components.
   - Przykład:

```jsx
// app/_layout.jsx
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen
    name="places/[id]"
    options={{ headerTitle: "Szczegóły miejsca" }}
  />
</Stack>
```

7. **Intencje – otwieranie lokalizacji w Mapach Google**
   - Aplikacja umożliwia otwarcie lokalizacji miejsca w Mapach Google poprzez intencję (link do mapy).
   - Przykład:

```jsx
// Otwieranie lokalizacji w Google Maps
import * as Linking from "expo-linking";

const openInMaps = (address) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  Linking.openURL(url);
};
```

---

## 2. Zrealizowane funkcje

### 2.1. Uwierzytelnianie użytkowników

Aplikacja umożliwia rejestrację, logowanie i wylogowanie użytkowników z wykorzystaniem Supabase.

**Fragment kodu (logowanie):**

```typescript
// services/AuthService.ts
export const loginUser = async (email: string, password: string) => {
  const { error } = await auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data } = await auth.getSession();
  return data;
};
```

**Ekran logowania:**
![login screen](wstaw_tutaj_zrzut_ekranu_logowania.png)

---

### 2.2. Zarządzanie motywem (jasny/ciemny)

Użytkownik może przełączać motyw aplikacji między jasnym i ciemnym.

**Fragment kodu:**

```tsx
// contexts/ThemeContext.tsx
const calculateTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "system") {
    return systemColorScheme === "dark" ? "dark" : "light";
  }
  return mode;
};
```

**Ekran ustawień z przełącznikiem motywu:**
![settings screen](wstaw_tutaj_zrzut_ekranu_ustawien.png)

---

### 2.3. Przeglądanie i filtrowanie atrakcji

Lista atrakcji z możliwością filtrowania po kategorii i wyszukiwania tekstowego.

**Fragment kodu:**

```jsx
// app/(tabs)/index.jsx
const filterPlaces = (query = searchQuery, category = selectedCategory) => {
  let filtered = places;
  if (query) {
    filtered = filtered.filter(
      (place) =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.description.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
    );
  }
  if (category) {
    filtered = filtered.filter((place) => place.category === category);
  }
  setFilteredPlaces(filtered);
};
```

**Lista atrakcji:**
![places list](wstaw_tutaj_zrzut_ekranu_listy_atrakcji.png)

---

### 2.4. Dodawanie nowych miejsc z obrazem

Użytkownik może dodać nowe miejsce wraz ze zdjęciem, które jest przesyłane do Supabase Storage.

**Fragment kodu:**

```typescript
// services/StorageService.ts
export const uploadImage = async (uri: string, fileName: string) => {
  const fileExt = uri.split(".").pop();
  const filePath = `${fileName}.${fileExt}`;
  const bucketName = "attraction-images";
  // ...
  const formData = new FormData();
  formData.append("file", {
    uri: uri,
    name: filePath,
    type: `image/${fileExt}`,
  } as any);
  // ...
  const response = await fetch(
    `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/${bucketName}/${filePath}`,
    { method: "POST", headers, body: formData }
  );
  // ...
};
```

**Formularz dodawania miejsca:**
![add place screen](wstaw_tutaj_zrzut_ekranu_dodawania_miejsca.png)

---

### 2.5. Szczegóły miejsca i system ocen

Możliwość przeglądania szczegółów miejsca oraz dodawania opinii i ocen.

**Fragment kodu (dodawanie opinii):**

```typescript
// services/ReviewService.ts
export const addReviewAndUpdateRating = async (
  placeId: string,
  userId: string,
  rating: number,
  review: string
): Promise<Review> => {
  // ...
  const { data: insertedReview, error: reviewError } = await db
    .from("reviews")
    .insert([
      {
        place_id: placeId,
        user_id: userId,
        rating,
        review,
        created_at: new Date().toISOString(),
      },
    ]);
  // ...
};
```

**Szczegóły miejsca:**
![place details](wstaw_tutaj_zrzut_ekranu_szczegolow_miejsca.png)

**Dodawanie opinii:**
![add review](wstaw_tutaj_zrzut_ekranu_dodawania_opinii.png)

---

### 2.6. Wyszukiwanie miejsc

Dedykowany ekran do wyszukiwania miejsc po nazwie, adresie lub opisie.

**Fragment kodu:**

```jsx
// app/(tabs)/search.jsx
const handleSearch = async () => {
  setLoading(true);
  try {
    const { data, error } = await db
      .from("places")
      .select("*")
      .or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`
      );
    if (error) throw error;
    setResults(data || []);
  } catch (error) {
    // ...
  } finally {
    setLoading(false);
  }
};
```

**Ekran wyszukiwania:**
![search screen](wstaw_tutaj_zrzut_ekranu_wyszukiwania.png)

---

### 2.7. Profil użytkownika

Ekran profilu z informacjami o użytkowniku i jego aktywnościach.

**Fragment kodu:**

```jsx
// app/(tabs)/profile.jsx
useEffect(() => {
  const fetchUserProfile = async () => {
    // ...
    const { data: userData, error: userError } = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    // ...
    setUserProfile(userData);
    // ...
  };
  if (user) fetchUserProfile();
}, [user]);
```

**Ekran profilu:**
![profile screen](wstaw_tutaj_zrzut_ekranu_profilu.png)

---

## 3. Podsumowanie

Aplikacja Tourist App oferuje:

- Uwierzytelnianie użytkowników
- Zarządzanie motywem
- Przeglądanie i filtrowanie atrakcji
- Dodawanie miejsc z obrazami
- Szczegóły miejsca i system ocen
- Wyszukiwanie miejsc
- Profil użytkownika

Kod źródłowy i architektura opierają się na React Native, Expo oraz Supabase (baza danych i storage). Dokumentację można łatwo rozszerzyć o zrzuty ekranu przed eksportem do PDF.
