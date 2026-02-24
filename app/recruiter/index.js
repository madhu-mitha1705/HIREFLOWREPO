import { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { useApp } from "../../store/context";

export default function Landing() {
const router = useRouter();
const { user, logout } = useApp();

useEffect(() => {
if (user?.role === "admin") {
router.replace("/admin");
return;
}
if (user?.role === "candidate") {
router.replace("/candidate");
return;
}
if (user?.role === "recruiter" && user?.isVerified) {
router.replace("/recruiter/home");
}
}, [router, user]);

const handleLogout = async () => {
await logout();
router.replace("/");
};

if (user?.role === "recruiter" && !user?.isVerified) {
return (
<View style={styles.pendingContainer}>
<View style={styles.pendingCard}>
<Text style={styles.pendingTitle}>Account Under Review</Text>
<Text style={styles.pendingText}>
Your signup details are recorded and sent to admin. You can access recruiter dashboard after approval.
</Text>
<Text style={styles.pendingStatus}>
Status: {(user?.verificationStatus || "pending").toUpperCase()}
</Text>
<TouchableOpacity style={styles.pendingButton} onPress={handleLogout}>
<Text style={styles.pendingButtonText}>Back to Login</Text>
</TouchableOpacity>
</View>
</View>
);
}

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.logo}>HireFlow</Text>
<Text style={styles.tagline}>Match. Connect. Hired.</Text>
</View>

<View style={styles.content}>
<Text style={styles.welcome}>Welcome!</Text>
<Text style={styles.instruction}>Please select your role to continue:</Text>

<View style={styles.roleContainer}>
<TouchableOpacity
style={[styles.roleCard, { backgroundColor: '#E0E7FF' }]}
onPress={() => router.push({ pathname: "/login", params: { role: 'candidate' } })}
>
<Text style={[styles.roleTitle, { color: COLORS.primary }]}>Job Seeker</Text>
<Text style={styles.roleDesc}>Find your dream job with skill matching</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.roleCard, { backgroundColor: '#D1FAE5' }]}
onPress={() => router.push({ pathname: "/login", params: { role: 'recruiter' } })}
>
<Text style={[styles.roleTitle, { color: COLORS.secondary }]}>Recruiter</Text>
<Text style={styles.roleDesc}>Post jobs and screen with video resumes</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.roleCard, { backgroundColor: '#F3F4F6' }]}
onPress={() => router.push({ pathname: "/login", params: { role: 'admin' } })}
>
<Text style={[styles.roleTitle, { color: COLORS.text }]}>Admin</Text>
<Text style={styles.roleDesc}>Manage the platform</Text>
</TouchableOpacity>
</View>
</View>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: COLORS.background,
padding: SIZES.padding,
},
header: {
marginTop: 40,
alignItems: 'center',
marginBottom: 30,
},
logo: {
fontSize: 32,
fontWeight: '800',
color: COLORS.primary,
letterSpacing: 1,
},
tagline: {
fontSize: 14,
color: COLORS.textLight,
marginTop: 5,
},
content: {
flex: 1,
justifyContent: 'center',
maxWidth: 500,
width: '100%',
alignSelf: 'center',
},
welcome: {
fontSize: SIZES.h2,
fontWeight: 'bold',
color: COLORS.text,
textAlign: 'center',
marginBottom: 8,
},
instruction: {
fontSize: SIZES.body,
color: COLORS.textLight,
textAlign: 'center',
marginBottom: 20,
},
roleContainer: {
gap: 12,
},
roleCard: {
padding: 16,
borderRadius: SIZES.borderRadius,
alignItems: 'center',
borderWidth: 1,
borderColor: 'transparent',
...SHADOWS.small
},
roleTitle: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 4,
},
roleDesc: {
fontSize: 13,
color: COLORS.text,
textAlign: 'center',
},
pendingContainer: {
flex: 1,
justifyContent: "center",
padding: SIZES.padding,
backgroundColor: COLORS.background,
},
pendingCard: {
backgroundColor: COLORS.card,
borderRadius: SIZES.borderRadius,
padding: 20,
...SHADOWS.medium,
},
pendingTitle: {
fontSize: 22,
fontWeight: "bold",
color: COLORS.text,
marginBottom: 8,
},
pendingText: {
fontSize: SIZES.body,
color: COLORS.textLight,
lineHeight: 22,
},
pendingStatus: {
marginTop: 12,
fontWeight: "700",
color: COLORS.secondary,
},
pendingButton: {
marginTop: 20,
backgroundColor: COLORS.primary,
paddingVertical: 12,
borderRadius: 8,
alignItems: "center",
},
pendingButtonText: {
color: "#fff",
fontWeight: "bold",
},
});
