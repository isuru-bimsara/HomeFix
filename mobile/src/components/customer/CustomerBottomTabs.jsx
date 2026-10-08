import React from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { usePathname, useRouter } from "expo-router";

export default function CustomerBottomTabs() {
  const router = useRouter();

  const pathname = usePathname();

  const tabs = [
    {
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      route: "/Customer/(tabs)",
    },
    {
      label: "Search",
      icon: "search-outline",
      activeIcon: "search",
      route: "/Customer/(tabs)/search",
    },
    {
      label: "Bookings",
      icon: "calendar-outline",
      activeIcon: "calendar",
      route: "/Customer/(tabs)/booking",
    },
    {
      label: "Notifications",
      icon: "notifications-outline",
      activeIcon: "notifications",
      route: "/Customer/(tabs)/notification",
    },
    {
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      route: "/Customer/(tabs)/profile",
    },
  ];

  const isActive = (route) => {
    if (
      route === "/Customer/(tabs)"
    ) {
      return (
        pathname ===
          "/Customer" ||
        pathname ===
          "/Customer/(tabs)"
      );
    }

    return pathname.startsWith(route);
  };

  const handlePress = (route) => {
    router.replace(route);
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <View className="h-[68px] flex-row items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(
            tab.route
          );

          return (
            <Pressable
              key={tab.label}
              onPress={() =>
                handlePress(tab.route)
              }
              className="flex-1 items-center justify-center"
            >
              <Ionicons
                name={
                  active
                    ? tab.activeIcon
                    : tab.icon
                }
                size={22}
                color={
                  active
                    ? "#008568"
                    : "#8A9995"
                }
              />

              <Text
                className={`mt-1 text-[9px] ${
                  active
                    ? "font-bold text-[#008568]"
                    : "text-[#8A9995]"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}