import { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useApp } from "../../store/context";
import { COLORS, SHADOWS, SIZES } from "../../constants/theme";

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { register } = useApp();
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;
  const role = roleParam || "candidate";
  const isRecruiter = role === "recruiter";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panCardNumber, setPanCardNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyContactNumber, setCompanyContactNumber] = useState("");
  const [companyGstProof, setCompanyGstProof] = useState("");
  const [companyLicense, setCompanyLicense] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  const handleBackToModules = () => {
    router.replace({ pathname: "/recruiter", params: { showModules: "1" } });
  };

  const handleRegister = async () => {
    if (loading) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      Alert.alert("Error", "Please fill in all basic account fields.");
      return;
    }

    const phoneRegex = /^\d{10,15}$/;
    const aadharRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let verificationData = null;
    if (isRecruiter) {
      const cleanPhone = phone.trim();
      const cleanPersonalAddress = personalAddress.trim();
      const cleanPersonalEmail = personalEmail.trim().toLowerCase();
      const cleanAadhar = aadharNumber.trim();
      const cleanPan = panCardNumber.trim().toUpperCase();
      const cleanCompanyName = companyName.trim();
      const cleanCompanyContact = companyContactNumber.trim();
      const cleanCompanyGst = companyGstProof.trim();
      const cleanCompanyLicense = companyLicense.trim();
      const cleanCompanyEmail = companyEmail.trim().toLowerCase();

      if (
        !cleanPhone ||
        !cleanPersonalAddress ||
        !cleanPersonalEmail ||
        !cleanAadhar ||
        !cleanPan ||
        !cleanCompanyName ||
        !cleanCompanyContact ||
        !cleanCompanyGst ||
        !cleanCompanyLicense ||
        !cleanCompanyEmail
      ) {
        Alert.alert("Error", "Please fill all recruiter verification fields.");
        return;
      }

      if (!phoneRegex.test(cleanPhone) || !phoneRegex.test(cleanCompanyContact)) {
        Alert.alert("Error", "Phone numbers must contain 10 to 15 digits.");
        return;
      }

      if (!aadharRegex.test(cleanAadhar)) {
        Alert.alert("Error", "Aadhar number must be exactly 12 digits.");
        return;
      }

      if (!panRegex.test(cleanPan)) {
        Alert.alert("Error", "PAN card number must be in the format LLLLLNNNNL.");
        return;
      }

      if (!emailRegex.test(cleanPersonalEmail) || !emailRegex.test(cleanCompanyEmail)) {
        Alert.alert("Error", "Please enter valid email addresses.");
        return;
      }

      verificationData = {
        fullName: cleanName,
        phone: cleanPhone,
        personalAddress: cleanPersonalAddress,
        personalGmail: cleanPersonalEmail,
        aadharNumber: cleanAadhar,
        panCardNumber: cleanPan,
        companyName: cleanCompanyName,
        companyContactNumber: cleanCompanyContact,
        companyGstProof: cleanCompanyGst,
        companyLicense: cleanCompanyLicense,
        companyGmail: cleanCompanyEmail,
      };
    }

    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role,
      skills: [],
      education: "",
      verificationData,
    };

    setLoading(true);
    let result;
    try {
      result = await register(userData);
    } finally {
      setLoading(false);
    }

    if (!result.success) {
      if (result.reason === "email_in_use") {
        Alert.alert("Error", "This email is already registered.");
      } else if (result.reason === "weak_password") {
        Alert.alert("Error", "Password must be at least 6 characters.");
      } else if (result.reason === "invalid_email") {
        Alert.alert("Error", "Please enter a valid email address.");
      } else if (result.reason === "email_password_disabled") {
        Alert.alert("Signup Disabled", "Enable Email/Password in Firebase Authentication -> Sign-in method.");
      } else if (result.reason === "network_error") {
        Alert.alert("Network Error", "Check your internet connection and try again.");
      } else if (result.reason === "verification_required") {
        Alert.alert("Error", "Recruiter verification details are required.");
      } else {
        const detail = result.errorCode ? `\nError code: ${result.errorCode}` : "";
        Alert.alert("Error", `Unable to create account right now.${detail}`);
      }
      return;
    }

    const nextPath = role === "admin" ? "/admin" : role === "recruiter" ? "/recruiter" : "/candidate";
    router.replace(nextPath);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToModules}>
            <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join as <Text style={styles.roleText}>{String(role).toUpperCase()}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. John Doe" />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="enter your email"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="choose a password"
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {isRecruiter ? (
              <>
                <Text style={styles.sectionTitle}>Personal Verification</Text>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="10 digit phone number"
                />

                <Text style={styles.label}>Personal Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={personalAddress}
                  onChangeText={setPersonalAddress}
                  multiline
                  placeholder="residential address"
                />

                <Text style={styles.label}>Personal Email</Text>
                <TextInput
                  style={styles.input}
                  value={personalEmail}
                  onChangeText={setPersonalEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="personal email"
                />

                <Text style={styles.label}>Aadhar Number</Text>
                <TextInput
                  style={styles.input}
                  value={aadharNumber}
                  onChangeText={(text) => setAadharNumber(text.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  maxLength={12}
                  placeholder="12-digit Aadhar"
                />

                <Text style={styles.label}>PAN Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={panCardNumber}
                  onChangeText={(text) => setPanCardNumber(text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholder="PAN number"
                />

                <Text style={styles.sectionTitle}>Company Verification</Text>
                <Text style={styles.label}>Company Name</Text>
                <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />

                <Text style={styles.label}>Company Contact Number</Text>
                <TextInput
                  style={styles.input}
                  value={companyContactNumber}
                  onChangeText={(text) => setCompanyContactNumber(text.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                />

                <Text style={styles.label}>GST Proof</Text>
                <TextInput style={styles.input} value={companyGstProof} onChangeText={setCompanyGstProof} />

                <Text style={styles.label}>Company License</Text>
                <TextInput style={styles.input} value={companyLicense} onChangeText={setCompanyLicense} />

                <Text style={styles.label}>Company Email</Text>
                <TextInput
                  style={styles.input}
                  value={companyEmail}
                  onChangeText={setCompanyEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </>
            ) : null}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Please wait..." : "Sign Up"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href={{ pathname: "/login", params: { role } }} asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </Link>
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
    justifyContent: "center",
  },
  content: {
    padding: SIZES.padding,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginTop: 6,
  },
  roleText: {
    fontWeight: "700",
    color: COLORS.secondary,
  },
  form: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: SIZES.borderRadius,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
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
  textArea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 8,
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
    color: COLORS.secondary,
    fontWeight: "bold",
    fontSize: SIZES.body,
  },
});
