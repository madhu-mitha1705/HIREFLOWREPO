import { useMemo } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function AdminVerifications() {
  const router = useRouter();
  const { user, allUsers, verificationRequests, reviewRecruiterVerification, logout } = useApp();
  const getStatus = (status) => (status || "pending").toString().trim().toLowerCase();

  const mergedRequests = useMemo(() => {
    const byRecruiterId = new Map();
    verificationRequests.forEach((request) => {
      const key = request?.recruiterId || request?.id;
      if (!key) return;
      byRecruiterId.set(key, request);
    });

    // Fallback source: pending verification data stored on recruiter profile.
    allUsers
      .filter((item) => item.role === "recruiter" && getStatus(item.verificationStatus) === "pending")
      .forEach((item) => {
        const key = item.id;
        if (byRecruiterId.has(key)) return;
        const profileRequest = item.pendingVerificationRequest || {};
        byRecruiterId.set(key, {
          id: `profile-${item.id}`,
          recruiterId: item.id,
          recruiterName: item.name,
          recruiterEmail: item.email,
          status: "pending",
          submittedAt: profileRequest.submittedAt || null,
          fullName: profileRequest.fullName || item.name || "",
          phone: profileRequest.phone || item.phone || "",
          personalAddress: profileRequest.personalAddress || "",
          personalGmail: profileRequest.personalGmail || item.email || "",
          aadharNumber: profileRequest.aadharNumber || "",
          panCardNumber: profileRequest.panCardNumber || "",
          companyName: profileRequest.companyName || item.company || "",
          companyContactNumber: profileRequest.companyContactNumber || item.companyContactNumber || "",
          companyGstProof: profileRequest.companyGstProof || "",
          companyLicense: profileRequest.companyLicense || "",
          companyGmail: profileRequest.companyGmail || item.companyGmail || "",
        });
      });

    return Array.from(byRecruiterId.values());
  }, [allUsers, verificationRequests]);

  const pendingRequests = useMemo(
    () => mergedRequests.filter((request) => getStatus(request.status) === "pending"),
    [mergedRequests]
  );

  const reviewedRequests = useMemo(
    () => mergedRequests.filter((request) => getStatus(request.status) !== "pending"),
    [mergedRequests]
  );

  if (user && user.role !== "admin") {
    return <Redirect href={{ pathname: "/login", params: { role: "admin" } }} />;
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading verifications...</Text>
      </View>
    );
  }

  const handleReview = async (requestId, decision) => {
    const ok = await reviewRecruiterVerification(requestId, decision);
    if (!ok) {
      Alert.alert("Error", "Unable to update verification request right now.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const renderRequest = ({ item, pending = false }) => (
    <View style={styles.verificationCard}>
      <Text style={styles.verificationName}>{item.recruiterName || "Recruiter"}</Text>
      <Text style={styles.verificationLine}>Login Email: {item.recruiterEmail || "-"}</Text>
      <Text style={styles.verificationLine}>Phone: {item.phone || "-"}</Text>
      <Text style={styles.verificationLine}>Address: {item.personalAddress || "-"}</Text>
      <Text style={styles.verificationLine}>Gmail: {item.personalGmail || "-"}</Text>
      <Text style={styles.verificationLine}>Aadhar: {item.aadharNumber || "-"}</Text>
      <Text style={styles.verificationLine}>PAN: {item.panCardNumber || "-"}</Text>
      <Text style={styles.verificationLine}>Company: {item.companyName || "-"}</Text>
      <Text style={styles.verificationLine}>Company Contact: {item.companyContactNumber || "-"}</Text>
      <Text style={styles.verificationLine}>GST Proof: {item.companyGstProof || "-"}</Text>
      <Text style={styles.verificationLine}>License: {item.companyLicense || "-"}</Text>
      <Text style={styles.verificationLine}>Company Gmail: {item.companyGmail || "-"}</Text>
      <Text style={styles.verificationLine}>Status: {getStatus(item.status).toUpperCase()}</Text>

      {pending ? (
        <View style={styles.verificationActions}>
          <TouchableOpacity
            style={[styles.reviewButton, styles.approveButton]}
            onPress={() => handleReview(item.id, "approved")}
          >
            <Text style={styles.reviewButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reviewButton, styles.rejectButton]}
            onPress={() => handleReview(item.id, "rejected")}
          >
            <Text style={styles.reviewButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Applicant Verifications</Text>
          <Text style={styles.headerSubtitle}>
            Pending: {pendingRequests.length} | Reviewed: {reviewedRequests.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pendingRequests}
        keyExtractor={(item, index) => String(item?.id || `verification-${index}`)}
        renderItem={({ item }) => renderRequest({ item, pending: true })}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Pending Requests</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pending verification applicants.</Text>
          </View>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>Reviewed Requests</Text>
            {reviewedRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No reviewed requests yet.</Text>
              </View>
            ) : (
              reviewedRequests.map((item) => (
                <View key={item.id}>{renderRequest({ item })}</View>
              ))
            )}
          </>
        }
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
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
  },
  list: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 4,
  },
  verificationCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    ...SHADOWS.small,
  },
  verificationName: {
    fontSize: SIZES.body,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  verificationLine: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  verificationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: COLORS.secondary,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 13,
  },
});
