import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function PostJob() {
  const router = useRouter();
  const { user, addJob } = useApp();
  const [loading, setLoading] = useState(false);
  const [jobStatusModal, setJobStatusModal] = useState(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.company || "");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [description, setDescription] = useState("");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
      return;
    }
    if (!user.isVerified) {
      router.replace({ pathname: "/login", params: { role: "recruiter" } });
    }
  }, [router, user]);

  const handleSubmit = async () => {
    if (loading) return;

    const cleanTitle = title.trim();
    const cleanCompany = company.trim();
    const cleanLocation = location.trim();
    const cleanType = type.trim();
    const cleanSalary = salary.trim();
    const cleanRequiredSkills = requiredSkills.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanCompany || !cleanLocation || !cleanType || !cleanRequiredSkills) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const skills = cleanRequiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      Alert.alert("Error", "Add at least one required skill.");
      return;
    }

    setLoading(true);
    const startedAt = Date.now();
    let result;
    try {
      result = await addJob({
        title: cleanTitle,
        company: cleanCompany,
        location: cleanLocation,
        type: cleanType,
        salary: cleanSalary || "Not disclosed",
        requiredSkills: skills,
        description: cleanDescription || "No description provided",
      });
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = 300 - elapsed;
      if (remaining > 0) {
        await wait(remaining);
      }
      setLoading(false);
    }

    if (!result?.success) {
      if (result?.reason === "duplicate_job") {
        setJobStatusModal("duplicate");
        return;
      }
      Alert.alert("Error", "Unable to post job right now.");
      return;
    }

    setJobStatusModal("success");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.title}>Post Job</Text>
          <Text style={styles.subtitle}>Create a new opening for candidates</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Frontend Developer"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Enter company name"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Bengaluru / Remote"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Job Type *</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="e.g. Full-Time"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Salary</Text>
            <TextInput
              style={styles.input}
              value={salary}
              onChangeText={setSalary}
              placeholder="e.g. 8-12 LPA"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Required Skills * (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={requiredSkills}
              onChangeText={setRequiredSkills}
              placeholder="e.g. React, JavaScript, CSS"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe the role"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Posting..." : "Post Job"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {jobStatusModal ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {jobStatusModal === "success" ? "Job Posted" : "Already Posted"}
            </Text>
            <Text style={styles.modalMessage}>
              {jobStatusModal === "success"
                ? "Job Posted"
                : "This job has already been posted."}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                const nextAction = jobStatusModal;
                setJobStatusModal(null);
                if (nextAction === "success") {
                  router.replace("/recruiter/home");
                }
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    padding: SIZES.padding,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: 18,
    ...SHADOWS.small,
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: SIZES.body,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: SIZES.body,
    fontWeight: "700",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    ...SHADOWS.small,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: SIZES.body,
    fontWeight: "700",
  },
});
