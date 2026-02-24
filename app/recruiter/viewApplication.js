import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

export default function ViewApplications() {
  const { applications, jobs, allUsers, user, updateApplicationStatus } = useApp();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
      return;
    }
    if (!user.isVerified) {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
    }
  }, [router, user]);

  // Get jobs posted by the current recruiter
  const recruiterJobs = jobs.filter(job => job.postedBy === user?.id);
  const recruiterJobIds = recruiterJobs.map(job => job.id);

  // Get applications for recruiter's jobs
  let recruiterApplications = applications.filter(app =>
    recruiterJobIds.includes(app.jobId)
  );

  // Filter by status if selected
  if (selectedStatus !== "all") {
    recruiterApplications = recruiterApplications.filter(app => app.status === selectedStatus);
  }

  const getJobDetails = (jobId) => jobs.find(j => j.id === jobId);
  const getCandidateDetails = (candidateId) => allUsers.find(u => u.id === candidateId);

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return COLORS.textLight;
      case "shortlisted":
        return COLORS.secondary;
      case "rejected":
        return COLORS.danger;
      default:
        return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
        return "time-outline";
      case "shortlisted":
        return "checkmark-circle-outline";
      case "rejected":
        return "close-circle-outline";
      default:
        return "time-outline";
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    await updateApplicationStatus(appId, newStatus);
  };

  const handleViewCandidateProfile = (candidateId, jobId) => {
    router.push({
      pathname: "/recruiter/candidateProfile",
      params: { candidateId, jobId },
    });
  };

  const renderApplicationCard = ({ item }) => {
    const job = getJobDetails(item.jobId);
    const candidate = getCandidateDetails(item.candidateId);
    const statusColor = getStatusColor(item.status);
    const iconName = getStatusIcon(item.status);

    if (!job || !candidate) return null;

    return (
      <View style={[styles.applicationCard, SHADOWS.medium]}>
        <View style={styles.cardHeader}>
          <View style={styles.candidateInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {candidate.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.candidateDetails}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidateEmail}>{candidate.email}</Text>
              <Text style={styles.jobPosition}>{job.title}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Ionicons name={iconName} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Match Score:</Text>
            <Text style={[styles.detailValue, { color: COLORS.secondary, fontWeight: "600" }]}>
              {item.score}%
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Applied:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: COLORS.secondary + "20" },
              item.status === "shortlisted" && styles.actionButtonDisabled
            ]}
            onPress={() => handleStatusChange(item.id, "shortlisted")}
            disabled={item.status === "shortlisted"}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.secondary} />
            <Text style={[styles.actionButtonText, { color: COLORS.secondary }]}>Shortlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: COLORS.danger + "20" },
              item.status === "rejected" && styles.actionButtonDisabled
            ]}
            onPress={() => handleStatusChange(item.id, "rejected")}
            disabled={item.status === "rejected"}
          >
            <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} />
            <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>Reject</Text>
          </TouchableOpacity>
        </View>

        {item.status === "shortlisted" ? (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleViewCandidateProfile(item.candidateId, item.jobId)}
          >
            <Ionicons name="person-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.profileButtonText}>View Candidate Profile</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Applied", value: "applied" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Rejected", value: "rejected" },
  ];

  const getTotalCount = (status) => {
    const filtered = applications.filter(app => recruiterJobIds.includes(app.jobId));
    if (status === "all") return filtered.length;
    return filtered.filter(app => app.status === status).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>Review and manage applicant submissions</Text>
      </View>

      {getTotalCount("all") === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={80} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No Applicants Yet</Text>
          <Text style={styles.emptyText}>
            Applications from candidates will appear here once they apply for your posted jobs.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <FlatList
              data={statusFilters}
              renderItem={({ item: filter }) => (
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedStatus === filter.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedStatus(filter.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedStatus === filter.value && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label} ({getTotalCount(filter.value)})
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.value}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
            />
          </View>

          {recruiterApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="filter-outline" size={80} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Applicants</Text>
              <Text style={styles.emptyText}>
                No applications match the selected filter.
              </Text>
            </View>
          ) : (
            <FlatList
              data={recruiterApplications}
              renderItem={renderApplicationCard}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
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
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.innerPadding,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingHorizontal: SIZES.innerPadding,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.small,
    fontWeight: "600",
    color: COLORS.text,
    whiteSpace: "nowrap",
  },
  filterButtonTextActive: {
    color: COLORS.card,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    gap: SIZES.innerPadding,
  },
  applicationCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SIZES.innerPadding,
  },
  candidateInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.innerPadding,
  },
  avatarText: {
    color: COLORS.card,
    fontSize: 20,
    fontWeight: "700",
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  candidateEmail: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  jobPosition: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginLeft: SIZES.innerPadding,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  detailsContainer: {
    padding: SIZES.innerPadding,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: SIZES.innerPadding,
    paddingHorizontal: SIZES.innerPadding,
    paddingBottom: SIZES.innerPadding,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: SIZES.borderRadius,
    gap: 6,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  profileButton: {
    marginHorizontal: SIZES.innerPadding,
    marginBottom: SIZES.innerPadding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    backgroundColor: COLORS.primary + "10",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  profileButtonText: {
    fontSize: SIZES.small,
    fontWeight: "700",
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: SIZES.h2,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SIZES.padding,
    textAlign: "center",
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginTop: SIZES.innerPadding,
    textAlign: "center",
    maxWidth: "80%",
  },
});
