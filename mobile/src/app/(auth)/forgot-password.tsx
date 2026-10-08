import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { requestPasswordReset, resetPassword } from "../../../lib/auth";

export default function ForgotPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(String(params.email || ""));
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim()) return Alert.alert("Email required", "Enter your customer or provider email.");
    try {
      setLoading(true);
      const result = await requestPasswordReset(email);
      setStep("RESET");
      Alert.alert("Code sent", result.message);
    } catch (error: any) {
      Alert.alert("Unable to continue", error?.response?.data?.message || "Unable to send a reset code.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!/^\d{6}$/.test(otp)) return Alert.alert("Invalid code", "Enter the 6-digit email code.");
    if (password.length < 8) return Alert.alert("Weak password", "Use at least 8 characters.");
    if (password !== confirmPassword) return Alert.alert("Password mismatch", "Both passwords must match.");
    try {
      setLoading(true);
      const result = await resetPassword(email, otp, password);
      Alert.alert("Password changed", result.message, [{ text: "LOGIN", onPress: () => router.replace("/(auth)/login") }]);
    } catch (error: any) {
      Alert.alert("Reset failed", error?.response?.data?.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#E9F0EE]" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28, paddingTop: 56 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => step === "RESET" ? setStep("EMAIL") : router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={21} color="#173A33" />
        </Pressable>
        <View className="mt-12 h-16 w-16 items-center justify-center rounded-[20px] bg-[#DDF4EC]">
          <Ionicons name="key-outline" size={31} color="#008568" />
        </View>
        <Text className="mt-6 text-[28px] font-bold text-[#173A33]">{step === "EMAIL" ? "Forgot password?" : "Create new password"}</Text>
        <Text className="mt-2 text-[14px] leading-6 text-[#71827D]">
          {step === "EMAIL" ? "Password reset is available for customer and service-provider accounts." : `Enter the code sent to ${email.trim().toLowerCase()}.`}
        </Text>

        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" editable={step === "EMAIL"} />
        {step === "RESET" && <>
          <Field label="Verification code" value={otp} onChangeText={(v: string) => setOtp(v.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit code" keyboardType="number-pad" />
          <Field label="New password" value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" secureTextEntry />
          <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Enter password again" secureTextEntry />
        </>}

        <Pressable onPress={step === "EMAIL" ? sendCode : changePassword} disabled={loading} className="mt-6 h-14 flex-row items-center justify-center rounded-full bg-[#008568]">
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-[14px] font-bold text-white">{step === "EMAIL" ? "SEND RESET CODE" : "CHANGE PASSWORD"}</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...props }: any) {
  return <View className="mt-5">
    <Text className="mb-2 text-[12px] font-bold text-[#173A33]">{label}</Text>
    <TextInput {...props} autoCapitalize="none" placeholderTextColor="#9AABA6" className="h-14 rounded-2xl border border-[#C8D7D2] bg-white px-4 text-[14px] text-[#173A33]" />
  </View>;
}
