import { useEffect } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function VideoResumeConnect() {
  const router = useRouter();
  const { user, jobs, applications, allUsers } = useApp();

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
      return;
    }
    if (!user.isVerified) {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
    }
  }, [router, user]);

  const recruiterJobIds = jobs.filter((job) => job.postedBy === user?.id).map((job) => job.id);
  const recruiterApplications = applications.filter((app) => recruiterJobIds.includes(app.jobId));

  const rows = recruiterApplications
    .map((app) => {
      const candidate = allUsers.find((item) => item.id === app.candidateId);
      const job = jobs.find((item) => item.id === app.jobId);
      if (!candidate || !job) return null;
      return { appId: app.id, candidate, job };
    })
    .filter(Boolean);

  const handleConnect = (candidateName, hasVideo) => {
    if (!hasVideo) {
      Alert.alert("Video Resume Missing", `${candidateName} has not uploaded a video resume yet.`);
      return;
    }
    Alert.alert("Connecting", `Starting video resume connection with ${candidateName}.`);
  };

  const renderCandidate = ({ item }) => {
    const hasVideo = !!item.candidate.videoResume;
    return (
      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.name}>{item.candidate.name}</Text>
        <Text style={styles.line}>Email: {item.candidate.email}</Text>
        <Text style={styles.line}>Applied For: {item.job.title}</Text>
        <Text style={styles.line}>Video Resume: {hasVideo ? "Available" : "Not Uploaded"}</Text>

        <TouchableOpacity
          style={[styles.connectButton, !hasVideo && styles.connectButtonDisabled]}
          onPress={() => handleConnect(item.candidate.name, hasVideo)}
        >
          <Ionicons name="videocam-outline" size={16} color="#fff" />
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Resume Connect</Text>
        <Text style={styles.subtitle}>Connect with candidates via video resumes</Text>
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="videocam-off-outline" size={72} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Candidates Yet</Text>
          <Text style={styles.emptyText}>Candidate video resume connections will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.appId}
          renderItem={renderCandidate}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.innerPadding,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  list: {
    padding: SIZES.padding,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: SIZES.borderRadius,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  line: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  connectButton: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: SIZES.h2,
    color: COLORS.text,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 4,
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
