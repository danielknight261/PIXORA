import { Link } from "expo-router";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { appVersion } from "@/env";

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Manage your SnapzDaddy profile and orders.</Text>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </Link>

      <Text style={styles.version}>Version {appVersion}</Text>
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
  version: {
    marginTop: "auto",
    fontSize: 12,
    color: "#94A3B8",
  },
});
