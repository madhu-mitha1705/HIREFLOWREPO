import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../store/context";
import { COLORS, SHADOWS, SIZES } from "../../constants/theme";

export default function RecruiterCandidateProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, allUsers, jobs, applications } = useApp();

  const candidateId = String(params.candidateId || "");
  const jobId = String(params.jobId || "");

  const recruiterJobIds = useMemo(
    () => jobs.filter((job) => job.postedBy === user?.id).map((job) => job.id),
    [jobs, user?.id]
  );

  const isAllowed = applications.some(
    (app) => app.candidateId === candidateId && recruiterJobIds.includes(app.jobId)
  );

  const candidate = allUsers.find((item) => item.id === candidateId);
  const appliedJob = jobs.find((item) => item.id === jobId);

  if (!user || user.role !== "recruiter" || !user.isVerified) {
    return <Redirect href={{ pathname: "/login", params: { role: "recruiter" } }} />;
  }

  if (!candidate || !isAllowed) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={54} color={COLORS.danger} />
        <Text style={styles.errorTitle}>Candidate Not Accessible</Text>
        <Text style={styles.errorText}>You can only view profiles that applied to your jobs.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const skills = candidate.skills || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{candidate.name?.charAt(0)?.toUpperCase() || "C"}</Text>
        </View>
        <Text style={styles.name}>{candidate.name}</Text>
        <Text style={styles.email}>{candidate.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Applied For</Text>
        <Text style={styles.cardValue}>{appliedJob?.title || "Job"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Education</Text>
        <Text style={styles.cardValue}>{candidate.education || "Not provided"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skills</Text>
        <View style={styles.skillsWrap}>
          {skills.length === 0 ? <Text style={styles.muted}>No skills listed.</Text> : null}
          {skills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Video Resume</Text>
        <Text style={styles.cardValue}>{candidate.videoResume ? "Uploaded" : "Not uploaded"}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Applications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  errorTitle: {
    marginTop: 10,
    fontSize: SIZES.h2,
    fontWeight: "700",
    color: COLORS.text,
  },
  errorText: {
    marginTop: 6,
    color: COLORS.textLight,
    textAlign: "center",
  },
  header: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    alignItems: "center",
    ...SHADOWS.small,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    marginTop: 10,
    fontSize: SIZES.h2,
    fontWeight: "700",
    color: COLORS.text,
  },
  email: {
    marginTop: 2,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary + "40",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillChipText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: SIZES.small,
  },
  muted: {
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  backButton: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
