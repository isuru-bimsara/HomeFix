import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text } from "react-native";
import Constants from "expo-constants";

type Props = {
  onToken: (idToken: string) => void;
  disabled?: boolean;
};

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function GoogleAuthButton({ onToken, disabled }: Props) {
  const [signingIn, setSigningIn] = useState(false);

  const startGoogleSignIn = async () => {
    if (Constants.appOwnership === "expo") {
      Alert.alert(
        "Install the HomeFix app",
        "Native Google Sign-In cannot run inside Expo Go. Install a HomeFix development, preview, or production APK."
      );
      return;
    }

    if (!webClientId || !webClientId.endsWith(".apps.googleusercontent.com")) {
      Alert.alert(
        "Google Sign-In is not configured",
        "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to mobile/.env and rebuild the app."
      );
      return;
    }

    try {
      setSigningIn(true);

      const {
        GoogleSignin,
        isSuccessResponse,
        isCancelledResponse,
      } = require("@react-native-google-signin/google-signin");

      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign out first so Android always lets the user choose the account.
      await GoogleSignin.signOut().catch(() => undefined);
      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) return;

      if (!isSuccessResponse(response) || !response.data.idToken) {
        Alert.alert(
          "Google Sign-In failed",
          "Google did not return a valid ID token."
        );
        return;
      }

      onToken(response.data.idToken);
    } catch (error: any) {
      try {
        const { isErrorWithCode, statusCodes } = require("@react-native-google-signin/google-signin");
        if (isErrorWithCode(error)) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) return;

          if (error.code === statusCodes.DEVELOPER_ERROR) {
            Alert.alert(
              "Google configuration error",
              "The Android package name or SHA-1 does not match the Google OAuth client."
            );
            return;
          }
        }
      } catch {
        // The APK was built before the native Google module was installed.
      }

      Alert.alert(
        "Google Sign-In failed",
        error?.message || "Please check the Google configuration and try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <Pressable
      onPress={startGoogleSignIn}
      disabled={disabled || signingIn}
      className="h-[48px] flex-row items-center justify-center rounded-full border border-[#CFD9D6] bg-white"
    >
      {signingIn ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <Text className="absolute left-[19px] text-[20px] font-bold text-[#4285F4]">
            G
          </Text>
          <Text className="text-[12px] font-bold text-[#173A33]">
            Continue with Google
          </Text>
        </>
      )}
    </Pressable>
  );
}
