import { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ApplicationsList() {
  const { jobs, applications, user } = useApp();
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

  // Get application count for each job
  const getApplicationCountForJob = (jobId) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  // Get application stats for each job
  const getJobStats = (jobId) => {
    const jobApps = applications.filter(app => app.jobId === jobId);
    return {
      total: jobApps.length,
      applied: jobApps.filter(app => app.status === "applied").length,
      shortlisted: jobApps.filter(app => app.status === "shortlisted").length,
      rejected: jobApps.filter(app => app.status === "rejected").length,
    };
  };

  const handleViewApplications = (jobId) => {
    router.push({
      pathname: "/recruiter/application",
      params: { jobId }
    });
  };

  const renderJobCard = ({ item }) => {
    const stats = getJobStats(item.id);

    return (
      <View style={[styles.jobCard, SHADOWS.medium]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.company}>{item.company}</Text>
          </View>
          <View style={styles.applicationBadge}>
            <Text style={styles.applicationCount}>{stats.total}</Text>
            <Text style={styles.applicationLabel}>Applied</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.textLight }]} />
            <Text style={styles.statLabel}>Applied</Text>
            <Text style={styles.statValue}>{stats.applied}</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.statLabel}>Shortlist</Text>
            <Text style={styles.statValue}>{stats.shortlisted}</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.statLabel}>Rejected</Text>
            <Text style={styles.statValue}>{stats.rejected}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.jobMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.metaText}>{item.type}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewApplications(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>View Applications</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Posted Jobs</Text>
        <Text style={styles.subtitle}>Monitor applications for your job postings</Text>
      </View>

      {recruiterJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
          <Text style={styles.emptyText}>Post a job to start receiving applications from candidates</Text>
        </View>
      ) : (
        <FlatList
          data={recruiterJobs}
          renderItem={renderJobCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          scrollIndicatorInsets={{ right: 1 }}
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
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    gap: SIZES.padding,
  },
  jobCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SIZES.innerPadding,
    paddingTop: SIZES.innerPadding,
    paddingBottom: SIZES.innerPadding,
  },
  titleContainer: {
    flex: 1,
    marginRight: SIZES.innerPadding,
  },
  jobTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  company: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  applicationBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
  },
  applicationCount: {
    fontSize: SIZES.h2,
    fontWeight: "700",
    color: COLORS.primary,
  },
  applicationLabel: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SIZES.innerPadding,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.text,
  },
  jobMeta: {
    flexDirection: "row",
    paddingHorizontal: SIZES.innerPadding,
    paddingVertical: SIZES.innerPadding,
    gap: SIZES.padding,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary + "10",
    paddingVertical: 12,
    marginHorizontal: SIZES.innerPadding,
    marginBottom: SIZES.innerPadding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    gap: 8,
  },
  viewButtonText: {
    fontSize: SIZES.body,
    fontWeight: "600",
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
    marginTop: SIZES.innerPadding,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: "center",
  },
});
