import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../lib/theme";
import { RequireOnboarded } from "../../lib/require-onboarded";

export default function AppLayout() {
  return (
    <RequireOnboarded>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: "Aujourd'hui",
            tabBarIcon: ({ color }) => <Text style={{ color }}>✦</Text>,
          }}
        />
        <Tabs.Screen
          name="chats/index"
          options={{
            title: "Messages",
            tabBarIcon: ({ color }) => <Text style={{ color }}>💬</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color }) => <Text style={{ color }}>◐</Text>,
          }}
        />
        {/* Écrans accessibles depuis les onglets mais pas dans la barre elle-même. */}
        <Tabs.Screen name="match/[id]" options={{ href: null }} />
        <Tabs.Screen name="chats/[id]" options={{ href: null }} />
      </Tabs>
    </RequireOnboarded>
  );
}
