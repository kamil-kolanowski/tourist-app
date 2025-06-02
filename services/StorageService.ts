import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Klucz API Supabase
const SUPABASE_KEY =
  Constants.expoConfig?.extra?.SUPABASE_KEY || process.env.SUPABASE_KEY;
const SUPABASE_URL =
  Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL;

// Przesyłanie zdjęcia
export const uploadImage = async (uri: string, fileName: string) => {
  try {
    const fileExt = uri.split(".").pop();
    const filePath = `${fileName}.${fileExt}`;

    const bucketName = fileName.startsWith("profile_")
      ? "profile-images" // Bucket na zdjęcia profilowe
      : "attraction-images"; // Bucket na zdjęcia atrakcji

    let sessionData = null;
    try {
      const storedSession = await AsyncStorage.getItem("supabase_session");
      if (storedSession) {
        sessionData = JSON.parse(storedSession);
      }
    } catch (e) {
      console.error(e);
    }

    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      name: filePath,
      type: `image/${fileExt}`,
    } as any);

    const headers: any = {
      apikey: SUPABASE_KEY,
      Authorization: sessionData?.access_token
        ? `Bearer ${sessionData.access_token}`
        : `Bearer ${SUPABASE_KEY}`,
    };

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`,
      {
        method: "POST",
        headers: headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      throw new Error(`Błąd przesyłania: ${response.status} ${errorText}`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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
      console.error(e);
    }

    const headers: any = {
      apikey: SUPABASE_KEY,
      Authorization: sessionData?.access_token
        ? `Bearer ${sessionData.access_token}`
        : `Bearer ${SUPABASE_KEY}`,
    };

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`,
      {
        method: "DELETE",
        headers: headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      throw new Error(`Błąd usuwania: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getImageURL = (filePath: string, isProfileImage = false) => {
  const bucketName = isProfileImage ? "profile-images" : "attraction-images";
  return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
};
