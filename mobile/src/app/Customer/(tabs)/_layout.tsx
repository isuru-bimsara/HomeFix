// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function ProviderTabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: "#008568",
//         tabBarInactiveTintColor: "#82908D",
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Dashboard",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="grid-outline"
//               color={color}
//               size={size}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="jobs"
//         options={{
//           title: "Jobs",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="briefcase-outline"
//               color={color}
//               size={size}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="messages"
//         options={{
//           title: "Messages",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="chatbubble-outline"
//               color={color}
//               size={size}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="notification"
//         options={{
//           title: "Notifications",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="notifications-outline"
//               color={color}
//               size={size}
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons
//               name="person-outline"
//               color={color}
//               size={size}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }


import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationCount } from "../../../context/NotificationContext";

export default function ServiceProviderTabsLayout() {
  const { unreadCount } = useNotificationCount();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#008568",
        tabBarInactiveTintColor: "#8A9995",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: "#E34D59", color: "white", fontSize: 9, minWidth: 17, height: 17 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen name="messages/[userId]" options={{ href: null }} />
      <Tabs.Screen name="messages/index" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking/status-success" options={{ href: null }} />
      <Tabs.Screen name="booking/messages/[bookingId]" options={{ href: null }} />
      <Tabs.Screen name="insurance/index" options={{ href: null }} />
      <Tabs.Screen name="insurance/create" options={{ href: null }} />
      <Tabs.Screen name="insurance/[id]" options={{ href: null }} />
    </Tabs>
  );
}
