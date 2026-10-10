import React from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#E9F0EE]">
        <ActivityIndicator
          size="large"
          color="#008568"
        />
      </View>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  // Customer
  if (user.role === "CUSTOMER") {
    return (
      <Redirect href="/Customer/(tabs)" />
    );
  }

  // Service Provider
  if (user.role === "SERVICE_PROVIDER") {
    return (
      <Redirect href="/ServiceProvider/(tabs)" />
    );
  }

  // Other roles are not available in mobile app yet
  return (
    <Redirect href="/(auth)/login" />
  );
}