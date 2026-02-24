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
import { Redirect } from "expo-router";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function RecruiterVerification() {
  const { user, submitRecruiterVerification, logout } = useApp();
  const [loading, setLoading] = useState(false);
  const [shouldGoToLogin, setShouldGoToLogin] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [personalAddress, setPersonalAddress] = useState("");
  const [personalGmail, setPersonalGmail] = useState(user?.email || "");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panCardNumber, setPanCardNumber] = useState("");
  const [companyName, setCompanyName] = useState(user?.company || "");
  const [companyContactNumber, setCompanyContactNumber] = useState("");
  const [companyGstProof, setCompanyGstProof] = useState("");
  const [companyLicense, setCompanyLicense] = useState("");
  const [companyGmail, setCompanyGmail] = useState("");

  if (!user || user.role !== "recruiter" || shouldGoToLogin) {
    return <Redirect href={{ pathname: "/login", params: { role: "recruiter" } }} />;
  }
  if (user.isVerified) {
    return <Redirect href="/recruiter/home" />;
  }

  const handleSubmit = async () => {
    if (loading) return;

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanPersonalAddress = personalAddress.trim();
    const cleanPersonalGmail = personalGmail.trim().toLowerCase();
    const cleanAadharNumber = aadharNumber.trim();
    const cleanPanCardNumber = panCardNumber.trim().toUpperCase();
    const cleanCompanyName = companyName.trim();
    const cleanCompanyContactNumber = companyContactNumber.trim();
    const cleanCompanyGstProof = companyGstProof.trim();
    const cleanCompanyLicense = companyLicense.trim();
    const cleanCompanyGmail = companyGmail.trim().toLowerCase();

    if (
      !cleanFullName ||
      !cleanPhone ||
      !cleanPersonalAddress ||
      !cleanPersonalGmail ||
      !cleanAadharNumber ||
      !cleanPanCardNumber ||
      !cleanCompanyName ||
      !cleanCompanyContactNumber ||
      !cleanCompanyGstProof ||
      !cleanCompanyLicense ||
      !cleanCompanyGmail
    ) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    const aadharRegex = /^\d{12}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert("Error", "Phone number should contain 10 digits.");
      return;
    }

    if (!phoneRegex.test(cleanCompanyContactNumber)) {
      Alert.alert("Error", "Company contact number should contain 10 to 15 digits.");
      return;
    }

    if (!aadharRegex.test(cleanAadharNumber)) {
      Alert.alert("Error", "Aadhar number should be exactly 12 digits.");
      return;
    }

    if (!emailRegex.test(cleanPersonalGmail) || !emailRegex.test(cleanCompanyGmail)) {
      Alert.alert("Error", "Please enter valid email addresses.");
      return;
    }

    setLoading(true);
    const submitted = await submitRecruiterVerification({
      fullName: cleanFullName,
      phone: cleanPhone,
      personalAddress: cleanPersonalAddress,
      personalGmail: cleanPersonalGmail,
      aadharNumber: cleanAadharNumber,
      panCardNumber: cleanPanCardNumber,
      companyName: cleanCompanyName,
      companyContactNumber: cleanCompanyContactNumber,
      companyGstProof: cleanCompanyGstProof,
      companyLicense: cleanCompanyLicense,
      companyGmail: cleanCompanyGmail,
    });
    setLoading(false);

    if (!submitted) {
      Alert.alert("Error", "Unable to submit verification right now.");
      return;
    }

    await logout();
    setShouldGoToLogin(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Recruiter Verification</Text>
            <Text style={styles.subtitle}>Fill personal and company credentials for admin approval</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/\D/g, "").slice(0,10))}
              keyboardType="number-pad"
               maxLength={10}
            />

            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter residential address"
              placeholderTextColor="#9CA3AF"
              value={personalAddress}
              onChangeText={setPersonalAddress}
              multiline
            />

            <Text style={styles.label}>Gmail *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. recruiter@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={personalGmail}
              onChangeText={setPersonalGmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Aadhar Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="12-digit Aadhar number"
              placeholderTextColor="#9CA3AF"
              value={aadharNumber}
              onChangeText={(text) => setAadharNumber(text.replace(/\D/g, ""))}
              keyboardType="number-pad"
              maxLength={12}
            />

            <Text style={styles.label}>PAN Card Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABCDE1234F"
              placeholderTextColor="#9CA3AF"
              value={panCardNumber}
              onChangeText={(text) => setPanCardNumber(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />

            <Text style={styles.sectionTitle}>Company Credentials</Text>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company name"
              placeholderTextColor="#9CA3AF"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Text style={styles.label}>Company Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company contact number"
              placeholderTextColor="#9CA3AF"
              value={companyContactNumber}
              onChangeText={(text) => setCompanyContactNumber(text.replace(/\D/g, ""))}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>GST Proof *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GST proof/reference"
              placeholderTextColor="#9CA3AF"
              value={companyGstProof}
              onChangeText={setCompanyGstProof}
            />

            <Text style={styles.label}>Company License *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company license number/reference"
              placeholderTextColor="#9CA3AF"
              value={companyLicense}
              onChangeText={setCompanyLicense}
            />

            <Text style={styles.label}>Company Gmail *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. company@gmail.com"
              placeholderTextColor="#9CA3AF"
              value={companyGmail}
              onChangeText={setCompanyGmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Submitting..." : "Verify"}</Text>
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
    justifyContent: "center",
  },
  content: {
    padding: SIZES.padding,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 22,
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
    textAlign: "center",
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 6,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: {
    color: "#fff",
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
});
