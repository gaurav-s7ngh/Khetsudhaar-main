import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/utils/supabase"; // Uses your main repo's utils
import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Define the interface locally since we removed the constants file
interface Scheme {
  id: string;
  icon: string;
  color: string;
  title_en: string;
  title_hi: string;
  desc_en: string;
  desc_hi: string;
}

export default function SchemesListScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isHindi = language === "hi";

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from("gov_schemes")
        .select("id, icon, color, title_en, title_hi, desc_en, desc_hi");

      if (error) throw error;
      if (data) setSchemes(data);
    } catch (err) {
      console.error("Error fetching schemes:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Scheme }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.color }]}
      onPress={() =>
        router.push({ pathname: "/schemes/[id]", params: { id: item.id } })
      }
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <FontAwesome5 name={item.icon as any} size={24} color="white" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {isHindi ? item.title_hi : item.title_en}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {isHindi ? item.desc_hi : item.desc_en}
        </Text>
        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, { color: item.color }]}>
            {t("view_details") || "View Details"}
          </Text>
          <FontAwesome5 name="arrow-right" size={12} color={item.color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("schemes_title") || "Govt Schemes",
          headerBackTitle: "",
        }}
      />

      <View style={styles.header}>
        <Text style={styles.subHeader}>
          {t("schemes_subtitle") || "Empowering Farmers"}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={schemes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, paddingBottom: 10 },
  subHeader: {
    color: "#aaa",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  listContent: { padding: 15 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderLeftWidth: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDesc: { color: "#bbb", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ctaText: { fontSize: 12, fontWeight: "bold" },
});
