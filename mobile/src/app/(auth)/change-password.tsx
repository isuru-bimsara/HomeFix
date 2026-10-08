import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { changePassword } from "../../../lib/auth";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordError = useMemo(() => {
    if (!newPassword) return "";
    if (newPassword.length < 8) return "Password must contain at least 8 characters.";
    if (newPassword === currentPassword) return "New password must be different from your current password.";
    return "";
  }, [newPassword, currentPassword]);
  const confirmError = confirmPassword && newPassword !== confirmPassword ? "Passwords do not match." : "";

  const submit = async () => {
    if (!currentPassword) return Alert.alert("Required", "Enter your current password.");
    if (passwordError || confirmError || !newPassword || !confirmPassword) {
      return Alert.alert("Check password", passwordError || confirmError || "Complete every password field.");
    }
    try {
      setLoading(true);
      const result = await changePassword(currentPassword, newPassword);
      await logout();
      Alert.alert("Password changed", result.message, [{ text: "LOGIN", onPress: () => router.replace("/(auth)/login") }]);
    } catch (error: any) {
      Alert.alert("Unable to change password", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <KeyboardAvoidingView className="flex-1 bg-[#E9F0EE]" behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 26, paddingTop: 54, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white"><Ionicons name="arrow-back" size={22} color="#173A33" /></Pressable>
      <View className="mt-10 h-20 w-20 items-center justify-center rounded-[24px] bg-[#DDF4EC]"><Ionicons name="shield-checkmark-outline" size={38} color="#008568" /></View>
      <Text className="mt-6 text-[27px] font-bold text-[#173A33]">Change password</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#71827D]">Use a strong password you have not used before.</Text>
      <PasswordField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} />
      <PasswordField label="New password" value={newPassword} onChangeText={setNewPassword} error={passwordError} />
      <PasswordField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} error={confirmError} />
      <Pressable onPress={submit} disabled={loading || !!passwordError || !!confirmError} className={`mt-7 h-14 flex-row items-center justify-center rounded-full ${loading || passwordError || confirmError ? "bg-[#75B5A6]" : "bg-[#008568]"}`}>
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-[14px] font-bold text-white">CHANGE PASSWORD</Text>}
      </Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function PasswordField({ label, value, onChangeText, error = "" }: any) {
  return <View className="mt-5"><Text className="mb-2 text-[12px] font-bold text-[#173A33]">{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} secureTextEntry autoCapitalize="none" placeholder="Enter password" placeholderTextColor="#9AABA6" className={`h-14 rounded-2xl border bg-white px-4 text-[14px] text-[#173A33] ${error ? "border-red-500" : "border-[#C8D7D2]"}`} />
    {!!error && <Text className="mt-2 text-[11px] text-red-600">{error}</Text>}
  </View>;
}
