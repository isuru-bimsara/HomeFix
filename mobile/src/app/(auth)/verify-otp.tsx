import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { resendVerificationOtp, verifyEmail } from "../../../lib/auth";
import { useAuth } from "../../context/AuthContext";

export default function VerifyOtp() {
  const params = useLocalSearchParams<{ email?: string; role?: string }>();
  const email = String(params.email || "").trim().toLowerCase();
  const { setAuth } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const submit = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid code", "Enter the 6-digit code from your email.");
      return;
    }
    try {
      setLoading(true);
      const result = await verifyEmail(email, otp);
      await setAuth(result.data.accessToken, result.data.refreshToken, result.data.user);
      router.replace(result.data.user.role === "CUSTOMER" ? "/Customer/(tabs)" : "/ServiceProvider/(tabs)");
    } catch (error: any) {
      Alert.alert("Verification failed", error?.response?.data?.message || "Unable to verify this code.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setResending(true);
      const result = await resendVerificationOtp(email);
      setSeconds(60);
      Alert.alert("Code sent", result.message);
    } catch (error: any) {
      Alert.alert("Unable to resend", error?.response?.data?.message || "Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  const hiddenEmail = email.replace(/^(.{2}).*(@.*)$/, "$1••••$2");

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#E9F0EE]" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className="flex-1 px-7 pt-14">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={21} color="#173A33" />
        </Pressable>
        <View className="mt-14 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#DDF4EC]">
            <Ionicons name="mail-unread-outline" size={38} color="#008568" />
          </View>
          <Text className="mt-6 text-[28px] font-bold text-[#173A33]">Verify your email</Text>
          <Text className="mt-2 text-center text-[14px] leading-6 text-[#71827D]">
            We sent a 6-digit verification code to{"\n"}
            <Text className="font-bold text-[#173A33]">{hiddenEmail}</Text>
          </Text>
        </View>
        <TextInput
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          autoFocus
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#B4C1BD"
          className="mt-9 h-16 rounded-2xl border border-[#C8D7D2] bg-white text-center text-[28px] font-bold tracking-[12px] text-[#173A33]"
        />
        <Pressable onPress={submit} disabled={loading} className="mt-5 h-14 flex-row items-center justify-center rounded-full bg-[#008568]">
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-[14px] font-bold text-white">VERIFY EMAIL</Text>}
        </Pressable>
        <View className="mt-6 flex-row justify-center">
          <Text className="text-[11px] text-[#71827D]">Didn’t receive the code? </Text>
          <Pressable onPress={resend} disabled={seconds > 0 || resending}>
            <Text className={`text-[11px] font-bold ${seconds > 0 ? "text-[#9AABA6]" : "text-[#008568]"}`}>
              {resending ? "Sending..." : seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
