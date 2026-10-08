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

import { googleLoginUser, registerProvider } from "../../../lib/auth";
import { clearPendingGoogleIdToken, getPendingGoogleIdToken } from "../../../lib/googleRegistration";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical Repair",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "AC & Refrigeration",
  "Other",
];

export default function ProviderRegister() {
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceLocation, setServiceLocation] =
    useState("");
  const [serviceCategory, setServiceCategory] =
    useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [experienceYears, setExperienceYears] =
    useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [description, setDescription] = useState("");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(() => getPendingGoogleIdToken());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let message = "";
    const trimmed = value.trim();
    if (name === "email" && !googleIdToken && !/^\S+@\S+\.\S+$/.test(trimmed)) message = "Enter a valid email address.";
    if (name === "password" && !googleIdToken && value.length < 8) message = "Password must contain at least 8 characters.";
    if ((name === "firstName" || name === "lastName") && trimmed.length < 2) message = "Enter at least 2 characters.";
    if (name === "phoneNumber" && trimmed && !/^(?:\+94|0)?7\d{8}$/.test(trimmed.replace(/\s/g, ""))) message = "Enter a valid Sri Lankan mobile number.";
    if (name === "serviceLocation" && trimmed.length < 2) message = "Enter your service location.";
    if (name === "experienceYears" && (!/^\d+$/.test(value) || Number(value) > 100)) message = "Enter a whole number from 0 to 100.";
    if (name === "hourlyRate" && (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0)) message = "Enter a valid hourly rate greater than 0.";
    setErrors((current) => ({ ...current, [name]: message }));
  };

  const handleRegister = async () => {
    if (!googleIdToken && !email.trim()) {
      Alert.alert("Required", "Enter your email.");
      return;
    }

    if (!googleIdToken && !password) {
      Alert.alert("Required", "Enter your password.");
      return;
    }

    if (!googleIdToken && password !== confirmPassword) {
      Alert.alert(
        "Password",
        "Passwords do not match."
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        "Required",
        "Enter your first and last name."
      );
      return;
    }

    if (!serviceLocation.trim() || !serviceCategory || !experienceYears || !hourlyRate || Object.values(errors).some(Boolean)) {
      Alert.alert("Check your details", "Correct the highlighted fields and select a service category.");
      if (!serviceCategory) setErrors((current) => ({ ...current, serviceCategory: "Select a service category." }));
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
        role: "SERVICE_PROVIDER",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        serviceLocation: serviceLocation.trim() || undefined,
        serviceCategory: serviceCategory.trim() || undefined,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        description: description.trim() || undefined,
      }) : await registerProvider({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber:
          phoneNumber.trim() || undefined,
        serviceLocation:
          serviceLocation.trim() || undefined,
        serviceCategory:
          serviceCategory.trim() || undefined,
        experienceYears: experienceYears
          ? Number(experienceYears)
          : undefined,
        hourlyRate: hourlyRate
          ? Number(hourlyRate)
          : undefined,
        description:
          description.trim() || undefined,
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
        router.replace("/ServiceProvider/(tabs)");
      } else {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: email.trim().toLowerCase(), role: "SERVICE_PROVIDER" },
        });
      }
    } catch (error: any) {
      console.log(
        "Provider registration error:",
        error?.response?.data || error
      );

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      Alert.alert(
        "Registration failed",
        message
      );
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

        <View className="mt-[18px]">
          <Text className="text-[22px] font-bold text-[#173A33]">
            Become a Service Provider
          </Text>

          <Text className="mt-[3px] text-[9px] text-[#82908D]">
            Create your HomeFix provider account
          </Text>
        </View>

        <View className="mt-[24px]">

          <GoogleAuthButton onToken={setGoogleIdToken} disabled={loading} />
          {googleIdToken ? <View className="mb-4 mt-3 rounded-xl bg-[#DDF4EC] px-4 py-3"><Text className="text-[10px] font-bold text-[#008568]">Google account verified. Complete your provider details below.</Text></View> : null}

          {!googleIdToken && <>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(value) => { setEmail(value); validateField("email", value); }}
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(value) => { setPassword(value); validateField("password", value); if (confirmPassword) setErrors((current) => ({ ...current, confirmPassword: value === confirmPassword ? "" : "Passwords do not match." })); }}
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(value) => { setConfirmPassword(value); setErrors((current) => ({ ...current, confirmPassword: value === password ? "" : "Passwords do not match." })); }}
            secureTextEntry
            error={errors.confirmPassword}
          />
          </>}

          <View className="flex-row">
            <View className="mr-[5px] flex-1">
              <Input
                label="First Name"
                placeholder="First name"
                value={firstName}
                onChangeText={(value) => { setFirstName(value); validateField("firstName", value); }}
                error={errors.firstName}
              />
            </View>

            <View className="ml-[5px] flex-1">
              <Input
                label="Last Name"
                placeholder="Last name"
                value={lastName}
                onChangeText={(value) => { setLastName(value); validateField("lastName", value); }}
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="Phone Number"
            placeholder="+94 7X XXX XXXX"
            value={phoneNumber}
            onChangeText={(value) => { setPhoneNumber(value); validateField("phoneNumber", value); }}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <Input
            label="Service Location"
            placeholder="Where do you provide services?"
            value={serviceLocation}
            onChangeText={(value) => { setServiceLocation(value); validateField("serviceLocation", value); }}
            error={errors.serviceLocation}
          />

          <View className="mt-[13px]">
            <Text className="mb-2 text-[12px] font-bold text-[#173A33]">Service Category</Text>
            <Pressable onPress={() => setCategoryOpen((open) => !open)} className="h-[54px] flex-row items-center rounded-[14px] border border-[#CEDAD6] bg-white px-4">
              <Text className={`flex-1 text-[14px] ${serviceCategory ? "text-[#173A33]" : "text-[#A0ADA9]"}`}>{serviceCategory || "Select your service"}</Text>
              <Ionicons name={categoryOpen ? "chevron-up" : "chevron-down"} size={18} color="#008568" />
            </Pressable>
            {categoryOpen ? <View className="mt-2 overflow-hidden rounded-[14px] border border-[#CEDAD6] bg-white">
              {SERVICE_CATEGORIES.map((category) => <Pressable key={category} onPress={() => { setServiceCategory(category); setCategoryOpen(false); setErrors((current) => ({ ...current, serviceCategory: "" })); }} className="border-b border-[#EDF2F0] px-4 py-3"><Text className="text-[13px] text-[#173A33]">{category}</Text></Pressable>)}
            </View> : null}
            {errors.serviceCategory ? <Text className="mt-1 text-[10px] text-red-600">{errors.serviceCategory}</Text> : null}
          </View>

          <Input
            label="Experience Years"
            placeholder="e.g. 5"
            value={experienceYears}
            onChangeText={(value) => { const clean = value.replace(/\D/g, ""); setExperienceYears(clean); validateField("experienceYears", clean); }}
            keyboardType="numeric"
            error={errors.experienceYears}
          />

          <Input
            label="Hourly Rate (LKR)"
            placeholder="e.g. 2500"
            value={hourlyRate}
            onChangeText={(value) => { const clean = value.replace(/[^0-9.]/g, ""); setHourlyRate(clean); validateField("hourlyRate", clean); }}
            keyboardType="decimal-pad"
            error={errors.hourlyRate}
          />

          <View className="mt-[13px]">
            <Text className="mb-[5px] text-[7px] font-bold text-[#173A33]">
              Description
            </Text>

            <View className="rounded-[10px] border border-[#CEDAD6] bg-white px-[11px] py-[8px]">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tell customers about your services"
                placeholderTextColor="#A0ADA9"
                multiline
                textAlignVertical="top"
                className="h-[70px] text-[8px] text-[#173A33]"
              />
            </View>
          </View>

          <Pressable
            onPress={() =>
              setTermsAccepted(!termsAccepted)
            }
            className="mt-[9px] flex-row items-center"
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

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="mt-5 h-[54px] items-center justify-center rounded-full bg-[#008568]"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[14px] font-bold text-white">
                {googleIdToken ? "Complete Google Registration" : "Create Provider Account"}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function Input({
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
