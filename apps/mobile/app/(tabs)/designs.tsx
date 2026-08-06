import { StyleSheet, Text, View } from "react-native";

export default function DesignsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved designs</Text>
      <Text style={styles.subtitle}>Your in-progress keepsakes will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#64748B",
  },
});
