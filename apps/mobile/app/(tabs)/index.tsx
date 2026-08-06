import { Link } from "expo-router";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { brand, productCategories } from "@pixora/shared";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>Pixora</Text>
      <Text style={styles.tagline}>{brand.tagline}</Text>
      <Text style={styles.subtitle}>
        Browse products and personalise your keepsakes on the go.
      </Text>

      <View style={styles.grid}>
        {productCategories.map((category) => (
          <View key={category} style={styles.card}>
            <Text style={styles.cardTitle}>{category}</Text>
            <Text style={styles.cardText}>
              Tap to start designing from your photo library.
            </Text>
          </View>
        ))}
      </View>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 64,
    backgroundColor: "#F8FAFC",
  },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
  },
  tagline: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "600",
    color: "#2563EB",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  grid: {
    marginTop: 32,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
  button: {
    marginTop: 32,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
