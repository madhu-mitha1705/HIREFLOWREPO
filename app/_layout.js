import { Stack } from "expo-router";
import { AppProvider } from "../store/context";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="candidate" />
          <Stack.Screen name="recruiter" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
