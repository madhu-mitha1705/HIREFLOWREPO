import { StyleSheet, Text, View, FlatList } from "react-native";
import { useApp } from "../../store/context";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ApplicationsList() {
const { applications, jobs, user } = useApp();

const myApplications = applications.filter(app => app.candidateId === user?.id);

const getJobDetails = (jobId) => jobs.find(j => j.id === jobId);

const renderItem = ({ item }) => {
const job = getJobDetails(item.jobId);
if (!job) return null;

let statusColor = COLORS.textLight;
let iconName = "time-outline";

if (item.status === 'shortlisted') {
statusColor = COLORS.secondary;
iconName = "checkmark-circle-outline";
} else if (item.status === 'rejected') {
statusColor = COLORS.danger;
iconName = "close-circle-outline";
}

return (
<View style={styles.card}>
<View style={styles.topRow}>
<Text style={styles.jobTitle}>{job.title}</Text>
<Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
</View>
<Text style={styles.company}>{job.company}</Text>

<View style={styles.divider} />

<View style={styles.statusRow}>
<Text style={styles.statusLabel}>Status:</Text>
<View style={styles.statusBadge}>
<Ionicons name={iconName} size={16} color={statusColor} />
<Text style={[styles.statusText, { color: statusColor }]}>
{item.status.toUpperCase()}
</Text>
</View>
</View>
</View>
);
};

return (
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.title}>My Applications</Text>
</View>

<FlatList
data={myApplications}
keyExtractor={item => item.id}
renderItem={renderItem}
contentContainerStyle={styles.list}
ListEmptyComponent={
<View style={styles.emptyContainer}>
<Text style={styles.emptyText}>You haven't applied to any jobs yet.</Text>
</View>
}
/>
</View>
);
}

const styles = StyleSheet.create({
container:{ 
flex: 1,
backgroundColor: COLORS.background,
},
header: {
padding: SIZES.padding,
backgroundColor: COLORS.card,
paddingTop: 50,
borderBottomWidth: 1,
borderColor: COLORS.border,
},
title: {
fontSize: 24,
fontWeight: "bold",
color: COLORS.text,
},
list: {
padding: SIZES.padding,
},
card: {
backgroundColor: COLORS.card,
borderRadius: SIZES.borderRadius,
padding: 16,
marginBottom: 16,
...SHADOWS.small
},
topRow: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 5,
},
jobTitle: {
fontSize: 16,
fontWeight: "bold",
color: COLORS.text,
},
date: {
fontSize: 12,
color: COLORS.textLight,
},
company: {
fontSize: 14,
color: COLORS.textLight,
},
divider: {
height: 1,
backgroundColor: COLORS.border,
marginVertical: 12,
},
statusRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
statusLabel: {
fontSize: 14,
color: COLORS.text,
},
statusBadge: {
flexDirection: 'row',
alignItems: 'center',
gap: 5,
},
statusText: {
fontWeight: "bold",
fontSize: 14,
},
emptyContainer: {
marginTop: 50,
alignItems: 'center',
},
emptyText: {
color: COLORS.textLight,
fontStyle: 'italic',
}
});
