import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationCount } from "../../../context/NotificationContext";
export default function PartnerTabs() {
  const { unreadCount } = useNotificationCount();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#008568",
        tabBarInactiveTintColor: "#82908D",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="claim"
        options={{
          title: "Claims",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarBadge:
            unreadCount > 0
              ? unreadCount > 99
                ? "99+"
                : unreadCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#E34D59",
            color: "white",
            fontSize: 9,
            minWidth: 17,
            height: 17,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="claims/[id]" options={{ href: null }} />
    </Tabs>
  );
}
