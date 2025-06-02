import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import Constants from "expo-constants";

const supabaseUrl =
  Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.SUPABASE_KEY || process.env.SUPABASE_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  realtime: {
    enabled: false,
  },
});

export const supabase = supabaseClient;
export const auth = supabaseClient.auth;
export const storage = supabaseClient.storage;
export const db = supabaseClient;
