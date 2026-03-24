import React from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function RecruiterLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const shouldShowTopBar = !["/recruiter", "/recruiter/login", "/recruiter/register"].includes(pathname);
  const backTargetByPath = {
    "/recruiter/home": { pathname: "/recruiter", params: { showModules: "1" } },
    "/recruiter/postJob": "/recruiter/home",
    "/recruiter/postedJobs": "/recruiter/home",
    "/recruiter/applicationList": "/recruiter/home",
    "/recruiter/application": "/recruiter/applicationList",
    "/recruiter/viewApplication": "/recruiter/applicationList",
    "/recruiter/candidateProfile": "/recruiter/applicationList",
    "/recruiter/videoResumeConnect": "/recruiter/home",
    "/recruiter/verification": "/recruiter",
  };
  const backTarget = backTargetByPath[pathname] || "/recruiter/home";
  const shouldShowModulesButton = pathname !== "/recruiter/home";

  return (
    <View style={styles.container}>
      {shouldShowTopBar ? (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace(backTarget)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {shouldShowModulesButton ? (
          <TouchableOpacity
            style={styles.modulesButton}
            onPress={() => router.replace({ pathname: "/recruiter", params: { showModules: "1" } })}
          >
            <Text style={styles.modulesButtonText}>Modules</Text>
          </TouchableOpacity>
          ) : <View style={styles.topBarSpacer} />}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  backButton: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
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
  topBarSpacer: {
    width: 74,
  },
});
