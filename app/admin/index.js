import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, allUsers, jobs, applications, verificationRequests, logout } = useApp();
  const getStatus = (status) => (status || "pending").toString().trim().toLowerCase();

  if (user && user.role !== "admin") {
    return <Redirect href={{ pathname: "/login", params: { role: "admin" } }} />;
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  const pendingRequests = verificationRequests.filter((request) => getStatus(request.status) === "pending");

  const stats = [
    { label: "Total Users", value: allUsers.length, color: COLORS.primary },
    { label: "Active Jobs", value: jobs.length, color: COLORS.secondary },
    { label: "Applications", value: applications.length, color: COLORS.warning },
    { label: "Verifications", value: pendingRequests.length, color: COLORS.danger },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const renderUser = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.name || "Unknown User"}</Text>
        <Text style={styles.userRole}>{String(item?.role || "unknown").toUpperCase()}</Text>
      </View>
      <Text style={styles.userEmail}>{item?.email || "-"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.verificationCta} onPress={() => router.push("/admin/verification")}>
          <View>
            <Text style={styles.verificationCtaTitle}>Applicant Verification Requests</Text>
            <Text style={styles.verificationCtaSubtitle}>
              {pendingRequests.length} pending recruiter verification requests
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Users</Text>
      <FlatList
        data={allUsers}
        keyExtractor={(item, index) => String(item?.id || `user-${index}`)}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: SIZES.body,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statsContainer: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    borderLeftWidth: 5,
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  quickActions: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 6,
  },
  sectionTitle: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  verificationCta: {
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...SHADOWS.small,
  },
  verificationCtaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  verificationCtaSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
  },
  list: {
    padding: SIZES.padding,
    paddingTop: 10,
  },
  userRow: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  userRole: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "bold",
  },
  userEmail: {
    color: COLORS.textLight,
    fontSize: 12,
  },
});
