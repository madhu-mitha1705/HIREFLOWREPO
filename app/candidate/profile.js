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
  const [videoResumeUrl, setVideoResumeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [videoOptionsVisible, setVideoOptionsVisible] = useState(false);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (!user) return;
    setEducation(user.education || "");
    setSkillsText((user.skills || []).join(", "));
    setVideoResume(user.videoResume || null);
    setVideoResumeUrl(/^https?:\/\//i.test(String(user.videoResume || "")) ? String(user.videoResume) : "");
  }, [user]);

  if (user && user.role !== "candidate") {
    return <Redirect href={{ pathname: "/login", params: { role: "candidate" } }} />;
  }
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
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
    setVideoOptionsVisible(true);
  };

  const handleSaveProfile = async () => {
    if (saving) return;

    const skills = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const cleanVideoResumeUrl = String(videoResumeUrl || "").trim();
    if (cleanVideoResumeUrl && !/^https?:\/\//i.test(cleanVideoResumeUrl)) {
      Alert.alert("Invalid URL", "Please enter a valid ImageKit URL starting with http:// or https://");
      return;
    }

    const finalVideoResume = cleanVideoResumeUrl || videoResume;

    setSaving(true);
    const startedAt = Date.now();
    try {
      const ok = await updateCandidateProfile({
        education,
        skills,
        videoResume: finalVideoResume,
      });

      if (!ok) {
        Alert.alert("Error", "Unable to save profile right now.");
        return;
      }

      setSaveSuccessVisible(true);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = 300 - elapsed;
      if (remaining > 0) {
        await wait(remaining);
      }
      setSaving(false);
    }
  };

  const displayVideoResume = String(videoResumeUrl || "").trim() || videoResume;

  return (
    <View style={styles.container}>
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
            {displayVideoResume ? `Attached: ${getVideoName(displayVideoResume)}` : "No video resume attached"}
          </Text>
          <Text style={styles.helperText}>Paste your ImageKit video URL (recommended)</Text>
          <TextInput
            style={styles.input}
            value={videoResumeUrl}
            onChangeText={setVideoResumeUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://ik.imagekit.io/your_path/video.mp4"
            placeholderTextColor="#9CA3AF"
          />
          <Text style={styles.helperText}>Maximum duration: {MAX_VIDEO_DURATION_LABEL}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoActionPress}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              {displayVideoResume ? "Replace (Camera / Device / PC)" : "Add (Camera / Device / PC)"}
            </Text>
          </TouchableOpacity>
          {displayVideoResume ? (
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
        <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSaveProfile} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Profile"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, saving && styles.buttonDisabled]} onPress={handleLogout} disabled={saving}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {videoOptionsVisible ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Video Resume</Text>
            <Text style={styles.modalMessage}>Choose how you want to attach your video resume.</Text>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={() => {
                setVideoOptionsVisible(false);
                handleRecordVideo();
              }}
            >
              <Text style={styles.modalPrimaryButtonText}>Record Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => {
                setVideoOptionsVisible(false);
                handleUploadVideoFile();
              }}
            >
              <Text style={styles.modalSecondaryButtonText}>Upload from Device/PC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setVideoOptionsVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {saveSuccessVisible ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Successfully saved!</Text>
            <Text style={styles.modalMessage}>Your candidate profile has been updated.</Text>
            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={() => setSaveSuccessVisible(false)}
            >
              <Text style={styles.modalPrimaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  buttonDisabled: {
    opacity: 0.7,
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
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  modalPrimaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalSecondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: "#EFF6FF",
  },
  modalSecondaryButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  modalCancelButton: {
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
  },
  modalCancelButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },
});
