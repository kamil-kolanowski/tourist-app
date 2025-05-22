import { storage } from "../SimpleSupabaseClient";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

// Przesyłanie zdjęcia
export const uploadImage = async (uri: string, fileName: string) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileExt = uri.split(".").pop();
    const filePath = `${fileName}.${fileExt}`;

    const { data, error } = await storage
      .from("attraction-images")
      .upload(filePath, decode(base64), {
        contentType: `image/${fileExt}`,
      });

    if (error) throw error;

    // Pobierz publiczny URL zdjęcia
    const { data: publicURLData } = storage
      .from("attraction-images")
      .getPublicUrl(filePath);

    return publicURLData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Usuwanie zdjęcia
export const deleteImage = async (filePath: string) => {
  const { error } = await storage.from("attraction-images").remove([filePath]);

  if (error) throw error;
};

// Pobieranie URL zdjęcia
export const getImageURL = (filePath: string) => {
  const { data } = storage.from("attraction-images").getPublicUrl(filePath);

  return data.publicUrl;
};
