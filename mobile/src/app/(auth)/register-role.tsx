import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clearPendingGoogleIdToken, getPendingGoogleIdToken } from "../../../lib/googleRegistration";

export default function RegisterRole() {
  const googleFlow = Boolean(getPendingGoogleIdToken());

  return (
    <View className="flex-1 bg-[#E9F0EE] px-[26px] pt-[55px]">

      <Pressable
        onPress={() => {
          if (googleFlow) clearPendingGoogleIdToken();
          router.back();
        }}
        className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white"
      >
        <Ionicons
          name="arrow-back"
          size={21}
          color="#173A33"
        />
      </Pressable>

      <View className="mt-[40px]">
        <Text className="text-[27px] font-bold text-[#173A33]">
          {googleFlow ? "Choose Your Role" : "Create Account"}
        </Text>

        <Text className="mt-[7px] text-[14px] text-[#788B85]">
          {googleFlow
            ? "Google account selected. Choose how you want to use HomeFix"
            : "Choose how you want to use HomeFix"}
        </Text>
      </View>

      <View className="mt-[35px]">

        <Pressable
          onPress={() =>
            router.push("/(auth)/customer-register")
          }
          className="mb-[18px] rounded-[20px] bg-white p-[20px]"
        >
          <View className="flex-row items-center">

            <View className="h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-[#E1F3EE]">
              <Ionicons
                name="home-outline"
                size={26}
                color="#008568"
              />
            </View>

            <View className="ml-[15px] flex-1">
              <Text className="text-[17px] font-bold text-[#173A33]">
                Customer
              </Text>

              <Text className="mt-[4px] text-[12px] text-[#788B85]">
                Find and book trusted home services
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#008568"
            />
          </View>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push("/(auth)/provider-register")
          }
          className="rounded-[20px] bg-white p-[20px]"
        >
          <View className="flex-row items-center">

            <View className="h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-[#E1F3EE]">
              <Ionicons
                name="construct-outline"
                size={26}
                color="#008568"
              />
            </View>

            <View className="ml-[15px] flex-1">
              <Text className="text-[17px] font-bold text-[#173A33]">
                Service Provider
              </Text>

              <Text className="mt-[4px] text-[12px] text-[#788B85]">
                Offer your home services to customers
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#008568"
            />
          </View>
        </Pressable>

      </View>
    </View>
  );
}
