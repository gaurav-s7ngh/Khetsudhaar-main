import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // <--- IMPORT useLocalSearchParams
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase";

// Static assets map
const cropImages: { [key: string]: any } = {
  coffee: require("../assets/images/crops/coffee.png"),
  coconut: require("../assets/images/crops/coconut.png"),
  rice: require("../assets/images/crops/rice.png"),
  banana: require("../assets/images/crops/banana.png"),
  cardamom: require("../assets/images/crops/cardamom.png"),
  black_pepper: require("../assets/images/crops/black_pepper.png"),
  ginger: require("../assets/images/crops/ginger.png"),
  cashew: require("../assets/images/crops/cashew.png"),
};

export default function CropSelectionScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams(); // <--- READ THE FLAG
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  // Find the 'crops' array and remove the Wheat entry:

  const crops = [
    { id: "rice", name: "Rice (Paddy)" },
    // { id: 'wheat', name: 'Wheat' }, <--- REMOVED THIS
    { id: "banana", name: "Banana" }, // Kept this
    { id: "coffee", name: "Coffee" },
    { id: "coconut", name: "Coconut" },
    { id: "cardamom", name: "Cardamom" },
    { id: "black_pepper", name: "Black Pepper" },
    { id: "ginger", name: "Ginger" },
    { id: "cashew", name: "Cashew" },
  ];

  const handleConfirm = async () => {
    if (!selectedCrop) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (userId) {
        // Save to Supabase profile
        await supabase
          .from("profiles")
          .update({ selected_crop: selectedCrop })
          .eq("id", userId);
      }

      // --- SMART NAVIGATION LOGIC ---
      if (source === "profile") {
        // Existing user editing profile -> Go to Dashboard
        router.replace("/dashboard");
      } else {
        // New user onboarding -> Go to Lesson 1
        router.replace({ pathname: "/lesson/[id]", params: { id: "1" } });
      }
    } catch (error) {
      console.error("Error saving crop:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("choose_crop")}</Text>
        <Text style={styles.subtitle}>Select what you grow</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {crops.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          return (
            <TouchableOpacity
              key={crop.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelectedCrop(crop.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.imageContainer,
                  isSelected && styles.imageContainerSelected,
                ]}
              >
                {cropImages[crop.id] ? (
                  <Image
                    source={cropImages[crop.id]}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <FontAwesome5
                    name="seedling"
                    size={32}
                    color={isSelected ? "#4CAF50" : "#888"}
                  />
                )}
              </View>
              <Text
                style={[styles.cropName, isSelected && styles.cropNameSelected]}
              >
                {crop.name}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <FontAwesome5 name="check" size={10} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selectedCrop && styles.buttonDisabled]}
          disabled={!selectedCrop}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>{t("confirm")}</Text>
          <FontAwesome5 name="arrow-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 24, paddingTop: 40 },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#888" },
  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 100,
  },
  card: {
    width: "48%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: { borderColor: "#4CAF50", backgroundColor: "#1E251E" },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  imageContainerSelected: { backgroundColor: "white" },
  image: { width: 50, height: 50 },
  cropName: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cropNameSelected: { color: "white" },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: "#333", opacity: 0.7 },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
