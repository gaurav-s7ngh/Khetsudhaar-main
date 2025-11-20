import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// 1. Load variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2. Debugging Check (Check your terminal logs when the app starts)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("------------------------------------------------");
  console.error("❌ SUPABASE ERROR: Missing Environment Variables");
  console.error("Please create a .env file in the root directory with:");
  console.error("EXPO_PUBLIC_SUPABASE_URL=...");
  console.error("EXPO_PUBLIC_SUPABASE_ANON_KEY=...");
  console.error("Then restart with: npx expo start -c");
  console.error("------------------------------------------------");
} else {
  console.log("✅ Supabase URL loaded:", supabaseUrl);
}

// --- Custom Secure Store Adapter for Expo ---
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// --- Initialize Supabase Client ---
// Pass the strings directly. If they are undefined, the client will throw a clearer error.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});