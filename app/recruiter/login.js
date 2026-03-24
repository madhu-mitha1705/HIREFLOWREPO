import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, user } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
  const role = roleParam || "candidate";
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (emailParam) {
      setEmail(String(emailParam));
    }
  }, [emailParam]);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (user.role === "candidate") {
      router.replace("/candidate");
      return;
    }
    if (user.role === "recruiter") {
      if (user.isVerified) {
        router.replace("/recruiter/home");
      } else {
        router.replace("/recruiter");
      }
    }
  }, [router, user]);

  const handleLogin = async () => {
    if (loading) return;

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const startedAt = Date.now();
    let result;
    try {
      result = await login(cleanEmail, cleanPassword);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = 300 - elapsed;
      if (remaining > 0) {
        await wait(remaining);
      }
      setLoading(false);
    }

    if (result.success) {
      if (nextParam) {
        router.replace(String(nextParam));
        return;
      }

      if (result.user.role === "admin") {
        router.replace("/admin");
      } else if (result.user.role === "recruiter") {
        if (result.verificationBlocked === "verification_pending") {
          Alert.alert("Verification Pending", "Your recruiter account is pending admin verification.");
        } else if (result.verificationBlocked === "verification_rejected") {
          Alert.alert("Verification Rejected", "Your recruiter account was rejected by admin.");
        }
        router.replace("/recruiter");
      } else {
        router.replace("/candidate");
      }
      return;
    }

    if (result.reason === "verification_pending") {
      Alert.alert("Verification Pending", "Your recruiter account is pending admin verification.");
    } else if (result.reason === "verification_rejected") {
      Alert.alert("Verification Rejected", "Your recruiter account was rejected by admin. Please contact support.");
    } else if (result.reason === "profile_missing") {
      Alert.alert("Profile Missing", "No user profile found for this account. Please register again.");
    } else if (result.reason === "wrong_password") {
      Alert.alert("Wrong Password", "The password you entered is incorrect.");
    } else if (result.reason === "email_password_disabled") {
      Alert.alert("Login Disabled", "Enable Email/Password in Firebase Authentication -> Sign-in method.");
    } else if (result.reason === "network_error") {
      Alert.alert("Network Error", "Check your internet connection and try again.");
    } else {
      const detail = result.errorCode ? `\nError code: ${result.errorCode}` : "";
      Alert.alert("Login Failed", `Unable to login right now.${detail}`);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Login as <Text style={{ fontWeight: "bold", color: COLORS.primary }}>{role.toUpperCase()}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Please wait..." : "Login"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href={{ pathname: "/register", params: { role } }} asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.demoHelp}>
          <Text style={styles.demoText}>Use your registered account credentials</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: SIZES.padding,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  form: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: SIZES.borderRadius,
    ...SHADOWS.medium,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: SIZES.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: SIZES.body,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: SIZES.body,
  },
  demoHelp: {
    marginTop: 30,
    alignItems: "center",
    opacity: 0.6,
  },
  demoText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
});
