import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { googleLoginUser, registerCustomer } from "../../../lib/auth";
import { clearPendingGoogleIdToken, getPendingGoogleIdToken } from "../../../lib/googleRegistration";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

export default function CustomerRegister() {
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [town, setTown] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(() => getPendingGoogleIdToken());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const trimmed = value.trim();
    let message = "";
    if (name === "email" && !googleIdToken && !/^\S+@\S+\.\S+$/.test(trimmed)) message = "Enter a valid email address.";
    if (name === "password" && !googleIdToken && value.length < 8) message = "Password must contain at least 8 characters.";
    if ((name === "firstName" || name === "lastName") && trimmed.length < 2) message = "Enter at least 2 characters.";
    if (name === "town" && trimmed.length < 2) message = "Enter your town.";
    if (name === "homeAddress" && trimmed.length < 5) message = "Enter a complete home address.";
    if (name === "phoneNumber" && trimmed && !/^(?:\+94|0)?7\d{8}$/.test(trimmed.replace(/\s/g, ""))) message = "Enter a valid Sri Lankan mobile number.";
    setErrors((current) => ({ ...current, [name]: message }));
  };

  const handleRegister = async () => {
    if (!googleIdToken && !email.trim()) {
      Alert.alert("Required", "Please enter your email.");
      return;
    }

    if (!googleIdToken && !password) {
      Alert.alert(
        "Required",
        "Please enter your password."
      );
      return;
    }

    if (!googleIdToken && password !== confirmPassword) {
      Alert.alert(
        "Password",
        "Passwords do not match."
      );
      return;
    }

    if (!firstName.trim()) {
      Alert.alert(
        "Required",
        "Please enter your first name."
      );
      return;
    }

    if (!lastName.trim()) {
      Alert.alert(
        "Required",
        "Please enter your last name."
      );
      return;
    }

    if (Object.values(errors).some(Boolean)) {
      Alert.alert("Check your details", "Correct the highlighted fields before continuing.");
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        "Terms",
        "Please accept the Terms & Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const result = googleIdToken ? await googleLoginUser({
        idToken: googleIdToken,
        role: "CUSTOMER",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        town: town.trim() || undefined,
        homeAddress: homeAddress.trim() || undefined,
      }) : await registerCustomer({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        town: town.trim() || undefined,
        homeAddress: homeAddress.trim() || undefined,
      });

      if (!result.success) {
        Alert.alert(
          "Registration failed",
          result.message
        );
        return;
      }

      if (googleIdToken) {
        await setAuth(result.data.accessToken, result.data.refreshToken, result.data.user);
        clearPendingGoogleIdToken();
        router.replace("/Customer/(tabs)");
      } else {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: email.trim().toLowerCase(), role: "CUSTOMER" },
        });
      }
    } catch (error: any) {
      console.log(
        "Customer registration error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      Alert.alert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#E9F0EE]">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 26,
          paddingTop: 40,
          paddingBottom: 180,
        }}
        enableOnAndroid
        enableAutomaticScroll
        extraHeight={140}
        extraScrollHeight={40}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#173A33"
          />
        </Pressable>

        {/* Header */}
        <View className="mt-[18px]">
          <Text className="text-[22px] font-bold text-[#173A33]">
            Create User Account
          </Text>

          <Text className="mt-[3px] text-[9px] text-[#82908D]">
            Register as a HomeFix user
          </Text>
        </View>

        {/* Progress */}
        <View className="mt-[12px] flex-row items-center">
          <View className="h-[4px] w-[4px] rounded-full bg-[#008568]" />

          <View className="ml-[4px] h-[2px] w-[45px] bg-[#008568]" />

          <View className="ml-[4px] h-[4px] w-[4px] rounded-full bg-[#B8C8C3]" />

          <View className="ml-[4px] h-[2px] w-[45px] bg-[#D0DBD8]" />

          <View className="ml-[4px] h-[4px] w-[4px] rounded-full bg-[#B8C8C3]" />
        </View>

        <View className="mt-[24px]"><GoogleAuthButton onToken={setGoogleIdToken} disabled={loading} /></View>
        {googleIdToken ? <View className="mt-3 rounded-xl bg-[#DDF4EC] px-4 py-3"><Text className="text-[10px] font-bold text-[#008568]">Google account verified. Complete your customer details below.</Text></View> : null}

        {!googleIdToken && <>
        <View className="mt-[11px] flex-row items-center">
          <View className="flex-1 h-[1px] bg-[#D2DDDA]" />

          <Text className="mx-[14px] text-[7px] text-[#82908D]">
            OR
          </Text>

          <View className="flex-1 h-[1px] bg-[#D2DDDA]" />
        </View>

        {/* Email */}
        <Field
          label="Email"
          placeholder="Enter your email address"
          value={email}
          onChangeText={(value) => { setEmail(value); validateField("email", value); }}
          keyboardType="email-address"
          error={errors.email}
        />

        {/* Password */}
        <Field
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(value) => { setPassword(value); validateField("password", value); if (confirmPassword) setErrors((current) => ({ ...current, confirmPassword: value === confirmPassword ? "" : "Passwords do not match." })); }}
          secureTextEntry
          error={errors.password}
        />

        {/* Confirm password */}
        <Field
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={(value) => { setConfirmPassword(value); setErrors((current) => ({ ...current, confirmPassword: value === password ? "" : "Passwords do not match." })); }}
          secureTextEntry
          error={errors.confirmPassword}
        />
        </>}

        {/* First + Last */}
        <View className="mt-[13px] flex-row">
          <View className="flex-1 mr-[5px]">
            <SmallField
              label="First Name"
              placeholder="First name"
              value={firstName}
              onChangeText={(value) => { setFirstName(value); validateField("firstName", value); }}
              error={errors.firstName}
            />
          </View>

          <View className="flex-1 ml-[5px]">
            <SmallField
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChangeText={(value) => { setLastName(value); validateField("lastName", value); }}
              error={errors.lastName}
            />
          </View>
        </View>

        {/* Town */}
        <Field
          label="Town"
          placeholder="Select your town"
          value={town}
          onChangeText={(value) => { setTown(value); validateField("town", value); }}
          error={errors.town}
        />

        {/* Home address */}
        <Field
          label="Home Address"
          placeholder="Enter your home address"
          value={homeAddress}
          onChangeText={(value) => { setHomeAddress(value); validateField("homeAddress", value); }}
          error={errors.homeAddress}
        />

        {/* Phone */}
        <Field
          label="Phone Number"
          placeholder="+94 7X XXX XXXX"
          value={phoneNumber}
          onChangeText={(value) => { setPhoneNumber(value); validateField("phoneNumber", value); }}
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />

        {/* Terms */}
        <Pressable
          onPress={() =>
            setTermsAccepted(!termsAccepted)
          }
          className="mt-[7px] flex-row items-center"
        >
          <View
            className={`h-[10px] w-[10px] items-center justify-center rounded-[2px] ${
              termsAccepted
                ? "bg-[#008568]"
                : "border border-[#94A7A1] bg-white"
            }`}
          >
            {termsAccepted && (
              <Ionicons
                name="checkmark"
                size={8}
                color="white"
              />
            )}
          </View>

          <Text className="ml-[5px] text-[7px] text-[#82908D]">
            I agree to the{" "}
            <Text className="font-bold text-[#008568]">
              Terms & Privacy Policy
            </Text>
          </Text>
        </Pressable>

        {/* Create Account */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className="mt-5 h-[54px] flex-row items-center justify-center rounded-full bg-[#008568]"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[14px] font-bold text-white">
              {googleIdToken ? "Complete Google Registration" : "Create Account"}
            </Text>
          )}
        </Pressable>

        {/* Login */}
        <View className="mt-[13px] items-center">
          <Text className="text-[7px] text-[#82908D]">
            Already have an account?
          </Text>

          <Pressable
            onPress={() =>
              router.replace("/(auth)/login")
            }
          >
            <Text className="mt-[3px] text-[8px] font-bold text-[#008568]">
              Login
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  error?: string;
}) {
  return (
    <View className="mt-[13px]">
      <Text className="mb-2 text-[12px] font-bold text-[#173A33]">
        {label}
      </Text>

      <View className={`h-[54px] justify-center rounded-[14px] border bg-white px-4 ${error ? "border-red-500" : "border-[#CEDAD6]"}`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0ADA9"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          className="text-[14px] text-[#173A33]"
        />
      </View>
      {error ? <Text className="mt-1 text-[10px] text-red-600">{error}</Text> : null}
    </View>
  );
}

function SmallField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}) {
  return (
    <View>
      <Text className="mb-2 text-[12px] font-bold text-[#173A33]">
        {label}
      </Text>

      <View className={`h-[54px] justify-center rounded-[14px] border bg-white px-4 ${error ? "border-red-500" : "border-[#CEDAD6]"}`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0ADA9"
          autoCapitalize="words"
          className="text-[14px] text-[#173A33]"
        />
      </View>
      {error ? <Text className="mt-1 text-[10px] text-red-600">{error}</Text> : null}
    </View>
  );
}
