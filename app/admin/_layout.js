import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.modulesButton}
          onPress={() => router.replace({ pathname: "/recruiter", params: { showModules: "1" } })}
        >
          <Text style={styles.modulesButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

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
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="verification"
          options={{
            title: "Verification",
            tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "flex-end",
    backgroundColor: COLORS.background,
  },
  modulesButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modulesButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
