import { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useApp } from "../../store/context";

export default function Home() {
const router = useRouter();
const { user, logout } = useApp();

useEffect(() => {
if (!user || user.role !== "recruiter") {
router.replace({ pathname: "/login", params: { role: "recruiter" } });
return;
}
if (!user.isVerified) {
router.replace({ pathname: "/login", params: { role: "recruiter" } });
}
}, [router, user]);

const handleLogout = async () => {
await logout();
router.replace("/");
};

return (
<View style={styles.container}>
<Text style={styles.title}>Welcome to HireFlow</Text>
<Text style={styles.subtitle}>Your smart job matchmaking platform</Text>

<View style={styles.buttonsContainer}>
<Link href="/recruiter/postJob" asChild>
<TouchableOpacity style={styles.button}>
<Text style={styles.buttonText}>Post Jobs</Text>
</TouchableOpacity>
</Link>

<Link href="/recruiter/postedJobs" asChild>
<TouchableOpacity style={styles.buttonSecondary}>
<Text style={styles.buttonSecondaryText}>My Posted Jobs</Text>
</TouchableOpacity>
</Link>

<Link href="/recruiter/videoResumeConnect" asChild>
<TouchableOpacity style={styles.buttonSecondary}>
<Text style={styles.buttonSecondaryText}>Video Resume Connect</Text>
</TouchableOpacity>
</Link>

<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
</View>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: "center",
padding: 30,
backgroundColor: "#fff",
},
title: {
fontSize: 32,
fontWeight: "bold",
textAlign: "center",
marginBottom: 10,
},
subtitle: {
fontSize: 16,
textAlign: "center",
color: "#555",
marginBottom: 40,
},
buttonsContainer: {
gap: 20,
},
button: {
backgroundColor: "#007AFF",
padding: 15,
borderRadius: 10,
},
buttonText: {
color: "#fff",
fontSize: 18,
fontWeight: "bold",
textAlign: "center",
},
buttonSecondary: {
padding: 15,
borderRadius: 10,
borderWidth: 1,
borderColor: "#007AFF",
},
buttonSecondaryText: {
color: "#007AFF",
fontSize: 18,
fontWeight: "bold",
textAlign: "center",
},
logoutButton: {
marginTop: 10,
},
logoutText: {
textAlign: "center",
color: "#FF3B30",
fontSize: 16,
fontWeight: "bold",
},
});
