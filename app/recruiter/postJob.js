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

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.company || "");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [description, setDescription] = useState("");

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
    if (!title || !company || !location || !type || !requiredSkills) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const skills = requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      Alert.alert("Error", "Add at least one required skill.");
      return;
    }

    setLoading(true);
    const posted = await addJob({
      title,
      company,
      location,
      type,
      salary: salary || "Not disclosed",
      requiredSkills: skills,
      description: description || "No description provided",
    });
    setLoading(false);

    if (!posted) {
      Alert.alert("Error", "Unable to post job right now.");
      return;
    }

    Alert.alert("Success", "Job posted successfully.", [
      {
        text: "OK",
        onPress: () => router.push("/recruiter/applicationList"),
      },
    ]);
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

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{loading ? "Posting..." : "Post Job"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  buttonText: {
    color: "#fff",
    fontSize: SIZES.body,
    fontWeight: "700",
  },
});
