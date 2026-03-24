import React from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function RecruiterLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const shouldShowModulesButton = !["/recruiter", "/recruiter/login", "/recruiter/register"].includes(pathname);

  return (
    <View style={styles.container}>
      {shouldShowModulesButton ? (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.modulesButton}
            onPress={() => router.replace({ pathname: "/recruiter", params: { showModules: "1" } })}
          >
            <Text style={styles.modulesButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "flex-end",
    backgroundColor: COLORS.background,
  },
  modulesButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modulesButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
