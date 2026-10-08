import { useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { registerNotificationDevice } from "../../../lib/notification";

export default function PushNotificationManager() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !Device.isDevice) return;
    const userRole = user.role;

    // Android remote push was removed from Expo Go in SDK 53.
    // In-app notifications still work there. Native push is initialized
    // only in a development build or installed production application.
    if (Constants.appOwnership === "expo") {
      console.log(
        "Push notifications skipped in Expo Go. Use a development build for notification-bar alerts."
      );
      return;
    }

    let responseSubscription: { remove: () => void } | undefined;
    let cancelled = false;

    async function setupPushNotifications() {
      try {
        // Lazy loading prevents Expo Go from evaluating the unsupported
        // Android remote-notification module during application startup.
        const Notifications = require("expo-notifications") as typeof import("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "HomeFix",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
          });
        }

        let permission = await Notifications.getPermissionsAsync();

        if (permission.status !== "granted") {
          permission = await Notifications.requestPermissionsAsync();
        }

        if (permission.status !== "granted" || cancelled) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const token = (
          await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;

        await registerNotificationDevice(token, Platform.OS);

        responseSubscription =
          Notifications.addNotificationResponseReceivedListener(() => {
            if (userRole === "CUSTOMER") {
              router.push("/Customer/(tabs)/notification");
            } else if (userRole === "SERVICE_PROVIDER") {
              router.push("/ServiceProvider/(tabs)/notification");
            } else if (userRole === "INSURANCE_PARTNER") {
              router.push("/InsuarancePartner/(tabs)/alerts");
            }
          });
      } catch (error) {
        console.log("Push notification setup skipped:", error);
      }
    }

    setupPushNotifications();

    return () => {
      cancelled = true;
      responseSubscription?.remove();
    };
  }, [router, user]);

  return null;
}
