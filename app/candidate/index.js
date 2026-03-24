import { useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function CandidateDashboard() {
  const { jobs, user, applyToJob } = useApp();
  const [search, setSearch] = useState("");
  const normalizedSearch = String(search || "").toLowerCase();

  const filteredJobs = jobs.filter(
    (job) =>
      String(job?.title || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(job?.company || "")
        .toLowerCase()
        .includes(normalizedSearch)
  );

  const handleApply = async (jobId) => {
    const applied = await applyToJob(jobId);
    if (!applied) {
      Alert.alert("Info", "You already applied to this job or submission failed.");
      return;
    }
    Alert.alert("Success", "Application Submitted!");
  };

  const getMatchPercentage = (jobSkills) => {
    const safeJobSkills = Array.isArray(jobSkills) ? jobSkills : [];
    if (!user || !user.skills) return 0;
    if (safeJobSkills.length === 0) return 0;
    const matchCount = user.skills.filter((skill) => safeJobSkills.includes(skill)).length;
    return Math.round((matchCount / safeJobSkills.length) * 100);
  };

  const renderItem = ({ item }) => {
    const requiredSkills = Array.isArray(item?.requiredSkills) ? item.requiredSkills : [];
    const match = getMatchPercentage(requiredSkills);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.jobTitle}>{item?.title || "Untitled Job"}</Text>
            <Text style={styles.company}>{item?.company || "Unknown Company"}</Text>
          </View>
          <View style={[styles.matchBadge, { backgroundColor: match > 70 ? COLORS.secondary : COLORS.warning }]}>
            <Text style={styles.matchText}>{match}% Match</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            <Ionicons name="location-outline" /> {item?.location || "Not specified"}
          </Text>
          <Text style={styles.detailText}>
            <Ionicons name="cash-outline" /> {item?.salary || "Not specified"}
          </Text>
        </View>

        <View style={styles.skillsRow}>
          {requiredSkills.map((skill) => (
            <View key={skill} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={() => handleApply(item?.id)} disabled={!item?.id}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || "Candidate"}</Text>
        <Text style={styles.subtext}>Find jobs that match your skills</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item, index) => String(item?.id || `job-${index}`)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No jobs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...SHADOWS.small,
  },
  greeting: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtext: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  list: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  company: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  skillTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  skillText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.textLight,
  },
});
