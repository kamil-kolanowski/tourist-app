import AsyncStorage from "@react-native-async-storage/async-storage";

// Przesyłanie zdjęcia z użyciem FormData
export const uploadImage = async (uri: string, fileName: string) => {
  try {
    const fileExt = uri.split(".").pop();
    const filePath = `${fileName}.${fileExt}`;

    const bucketName = fileName.startsWith("profile_")
      ? "profile-images" // Bucket na zdjęcia profilowe
      : "attraction-images"; // Bucket na zdjęcia atrakcji

    // Pobierz token sesji z AsyncStorage
    let sessionData = null;
    try {
      const storedSession = await AsyncStorage.getItem("supabase_session");
      if (storedSession) {
        sessionData = JSON.parse(storedSession);
      }
    } catch (e) {
      console.error("Błąd ładowania sesji:", e);
    }

    // Klucz API Supabase
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs";

    // Utwórz FormData do przesłania pliku
    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      name: filePath,
      type: `image/${fileExt}`,
    } as any);

    // Utwórz poprawne nagłówki autoryzacji
    const headers: any = {
      apikey: SUPABASE_KEY,
      Authorization: sessionData?.access_token
        ? `Bearer ${sessionData.access_token}`
        : `Bearer ${SUPABASE_KEY}`,
    };

    console.log(`Wysyłam plik do bucketa: ${bucketName}, path: ${filePath}`);

    // Użyj bezpośrednio API Supabase Storage
    const response = await fetch(
      `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/${bucketName}/${filePath}`,
      {
        method: "POST",
        headers: headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd odpowiedzi Supabase Storage:", errorText);
      throw new Error(`Błąd przesyłania: ${response.status} ${errorText}`);
    }

    // Zwróć publiczny URL obrazu
    const publicUrl = `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Usuwanie zdjęcia
export const deleteImage = async (filePath: string, isProfileImage = false) => {
  try {
    const bucketName = isProfileImage ? "profile-images" : "attraction-images";

    // Pobierz token sesji z AsyncStorage
    let sessionData = null;
    try {
      const storedSession = await AsyncStorage.getItem("supabase_session");
      if (storedSession) {
        sessionData = JSON.parse(storedSession);
      }
    } catch (e) {
      console.error("Błąd ładowania sesji:", e);
    }

    // Utwórz nagłówki autoryzacji
    const headers: any = {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs",
      Authorization: sessionData?.access_token
        ? `Bearer ${sessionData.access_token}`
        : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZHV5cGJ0Z2J3bWtjcnF2ZHV2Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDc4MTQ3MTEsImV4cCI6MjA2MzM5MDcxMX0.c6efgkhJ6ayi3UJeAjjJcWKD82uzf6Hq3hjuJATEPvs`,
    };

    const response = await fetch(
      `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/${bucketName}/${filePath}`,
      {
        method: "DELETE",
        headers: headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd podczas usuwania pliku:", errorText);
      throw new Error(`Błąd usuwania: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Pobieranie URL zdjęcia
export const getImageURL = (filePath: string, isProfileImage = false) => {
  const bucketName = isProfileImage ? "profile-images" : "attraction-images";
  return `https://lxduypbtgbwmkcrqvduv.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
};
