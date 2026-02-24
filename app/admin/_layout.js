import { Tabs } from "expo-router";
import { COLORS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
 return (
 <Tabs
 screenOptions={{
 headerShown: false,
 tabBarActiveTintColor: COLORS.text,
 tabBarInactiveTintColor: COLORS.textLight,
 }}
 >
 <Tabs.Screen
 name="index"
 options={{
 title: "Dashboard",
 tabBarIcon: ({ color, size }) => (
 <Ionicons name="stats-chart" size={size} color={color} />
 ),
 }}
 />
 <Tabs.Screen
 name="verification"
 options={{
 title: "Verification",
 tabBarIcon: ({ color, size }) => (
 <Ionicons name="shield-checkmark" size={size} color={color} />
 ),
 }}
 />
 </Tabs>
 );
}
