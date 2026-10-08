import React from "react";

import {
    Pressable,
    Text,
    View,
} from "react-native";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

export default function BookingCompleted() {
    const router = useRouter();

    const { bookingId } =
        useLocalSearchParams();

    const openBookingDetails = () => {
        router.replace({
            pathname:
                "/Customer/(tabs)/booking/booking-details/[id]",
            params: {
                id: String(bookingId),
            },
        });
    };

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-full rounded-[30px] bg-white px-7 py-12">
                    <View className="items-center">
                        <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-[#008568]">
                            <Ionicons
                                name="checkmark"
                                size={45}
                                color="#008568"
                            />
                        </View>

                        <Text className="mt-5 text-xl font-bold text-[#1E2926]">
                            Completed
                        </Text>

                        <Text className="mt-2 text-center text-sm text-[#697873]">
                            Your booking request has been
                            submitted successfully.
                        </Text>

                        <Pressable
                            onPress={openBookingDetails}
                            className="mt-7 rounded-full bg-[#008568] px-10 py-3"
                        >
                            <Text className="font-bold text-white">
                                OK
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}