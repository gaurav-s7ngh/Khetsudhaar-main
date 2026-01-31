import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

const { width } = Dimensions.get("window");

const languages = [
  { id: "en", name: "English", native: "English" },
  { id: "hi", name: "Hindi", native: "हिन्दी" },
  { id: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "ml", name: "Malayalam", native: "മലയാളം" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, setLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (langId: string) => {
    setSelectedLanguage(langId);
    setLanguage(langId);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        // 1. Update Language in Profile
        await supabase
          .from("profiles")
          .update({ language: selectedLanguage })
          .eq("id", userId);

        // 2. CHECK IF CROP IS ALREADY SELECTED (Prevent Loop)
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_crop")
          .eq("id", userId)
          .single();

        if (profile?.selected_crop) {
          // If they have a crop, they are an existing user editing settings.
          // Send them back to Dashboard (or Profile, if you prefer)
          router.replace("/dashboard");
        } else {
          // New User (No crop yet) -> Continue Onboarding
          router.replace("/crop");
        }
      } else {
        // Fallback if no user session (shouldn't happen here usually)
        router.replace("/crop");
      }
    } catch (error) {
      console.error("Error updating language:", error);
      // Even if error, try to move forward
      router.replace("/crop");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("choose_language")}</Text>
          <Text style={styles.subtitle}>
            {t("choose_your_language_in_hindi")}
          </Text>
        </View>

        {/* Language Grid */}
        <View style={styles.grid}>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleLanguageSelect(lang.id)}
                activeOpacity={0.8}
              >
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.nativeName,
                      isSelected && styles.textSelected,
                    ]}
                  >
                    {lang.native}
                  </Text>
                  <Text
                    style={[
                      styles.englishName,
                      isSelected && styles.textSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </View>

                {/* Radio Button Circle */}
                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !selectedLanguage && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedLanguage}
          >
            <Text style={styles.buttonText}>{t("confirm")}</Text>
            <FontAwesome5 name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { flex: 1, padding: 24, justifyContent: "center" },

  header: { marginBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: { fontSize: 16, color: "#888" },

  grid: { gap: 16 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#1E251E",
  },

  textContainer: { gap: 4 },
  nativeName: { fontSize: 18, fontWeight: "bold", color: "white" },
  englishName: { fontSize: 14, color: "#888" },
  textSelected: { color: "#4CAF50" },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#4CAF50",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },

  footer: { marginTop: 40 },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#333",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
