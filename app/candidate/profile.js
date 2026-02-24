import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../store/context";
import { COLORS, SHADOWS, SIZES } from "../../constants/theme";

const MAX_VIDEO_SECONDS = 600;
const MAX_VIDEO_DURATION_LABEL = "10 minutes";
const getVideoName = (uri = "") => {
  const clean = String(uri || "").split("?")[0];
  const parts = clean.split("/");
  return parts[parts.length - 1] || clean;
};

export default function CandidateProfile() {
  const router = useRouter();
  const { user, logout, updateCandidateProfile } = useApp();

  const [education, setEducation] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [videoResume, setVideoResume] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEducation(user.education || "");
    setSkillsText((user.skills || []).join(", "));
    setVideoResume(user.videoResume || null);
  }, [user]);

  if (!user || user.role !== "candidate") {
    return <Redirect href={{ pathname: "/login", params: { role: "candidate" } }} />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const validateVideoDuration = (asset) => {
    const durationMs = Number(asset?.duration || 0);
    if (!durationMs) return true;
    if (durationMs > MAX_VIDEO_SECONDS * 1000) {
      Alert.alert("Video Too Long", `Please select a video up to ${MAX_VIDEO_DURATION_LABEL}.`);
      return false;
    }
    return true;
  };

  const attachVideoAsset = (asset) => {
    if (!asset?.uri) return;
    if (!validateVideoDuration(asset)) return;
    setVideoResume(asset.uri);
    Alert.alert("Video Attached", "Video resume selected successfully.");
  };

  const handleRecordVideo = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required to record video.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      videoMaxDuration: MAX_VIDEO_SECONDS,
      quality: 1,
    });

    if (result.canceled) return;
    attachVideoAsset(result.assets?.[0]);
  };

  const handleUploadVideoFile = async () => {
    if (Platform.OS !== "web") {
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== "granted") {
        Alert.alert("Permission Required", "Media library permission is required to upload video.");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;
    attachVideoAsset(result.assets?.[0]);
  };

  const handleVideoActionPress = () => {
    Alert.alert("Video Resume", "Choose how you want to attach your video resume.", [
      { text: "Cancel", style: "cancel" },
      { text: "Record Video", onPress: handleRecordVideo },
      { text: "Upload from Device/PC", onPress: handleUploadVideoFile },
    ]);
  };

  const handleSaveProfile = async () => {
    if (saving) return;

    const skills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    setSaving(true);
    const ok = await updateCandidateProfile({
      education,
      skills,
      videoResume,
    });
    setSaving(false);

    if (!ok) {
      Alert.alert("Error", "Unable to save profile right now.");
      return;
    }

    Alert.alert("Saved", "Profile details were saved successfully.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || "C"}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Resume</Text>
        <View style={styles.videoCard}>
          <Text style={styles.videoLabel}>
            {videoResume ? `Attached: ${getVideoName(videoResume)}` : "No video resume attached"}
          </Text>
          <Text style={styles.helperText}>Maximum duration: {MAX_VIDEO_DURATION_LABEL}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoActionPress}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              {videoResume ? "Replace (Camera / Device / PC)" : "Add (Camera / Device / PC)"}
            </Text>
          </TouchableOpacity>
          {videoResume ? (
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleUploadVideoFile}>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryActionButtonText}>Upload from Device/PC</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.helperText}>Enter skills separated by commas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={skillsText}
          onChangeText={setSkillsText}
          placeholder="e.g. React, JavaScript, SQL"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={setEducation}
          placeholder="e.g. B.Tech Computer Science"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Profile"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textLight,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  videoCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  videoLabel: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryActionButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 11,
    backgroundColor: "#EFF6FF",
  },
  secondaryActionButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  textArea: {
    minHeight: 86,
    textAlignVertical: "top",
  },
  footerActions: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 13,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 13,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
