import { Tabs } from "expo-router";
import { COLORS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons"; // Assuming @expo/vector-icons is available (standard in Expo)

export default function CandidateLayout() {
    return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
        },
    }}
>
    <Tabs.Screen
    name="index"
    options={{
        title: "Jobs",
        tabBarIcon: ({ color, size }) => (
        <Ionicons name="briefcase" size={size} color={color} />
     ),
    }}
/>
<Tabs.Screen
name="applications"
options={{
    title: "My Activity",
    tabBarIcon: ({ color, size }) => (
    <Ionicons name="list" size={size} color={color} />
),
}}
/>
<Tabs.Screen
name="profile"
options={{
    title: "Profile",
    tabBarIcon: ({ color, size }) => (
    <Ionicons name="person" size={size} color={color} />
),
}}
/>
</Tabs>
);
}
