
//mobile/src/app/_layout.tsx
import "../../global.css";

import { Stack } from "expo-router";

import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import PushNotificationManager from "../components/notifications/PushNotificationManager";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PushNotificationManager />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </NotificationProvider>
    </AuthProvider>
  );
}
