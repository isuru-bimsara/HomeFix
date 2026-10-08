import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import ZoomableImage from "../../../../components/common/ZoomableImage";

import {
    createBooking,
} from "../../../../../lib/booking";
import { getProviderById } from "../../../../../lib/provider";
import {
    getBookingDraft,
    removeBookingDraft,
} from "../../../../../lib/booking-draft";

export default function ConfirmBooking() {
    const router = useRouter();

    const { draftId } = useLocalSearchParams();
    const draftKey = String(draftId || "");
    const [draft] = useState(() => getBookingDraft(draftKey));

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const confirmingRef = useRef(false);

    const booking = draft?.data;
    const customerImages = draft?.images || [];
    const serviceProviderId = booking?.serviceProviderId;

    useEffect(() => {
        loadProvider();
    }, [serviceProviderId]);

    const loadProvider = async () => {
        if (!draft || !serviceProviderId) {
            Alert.alert(
                "Booking Draft Missing",
                "Please return and enter the booking details again.",
                [{ text: "OK", onPress: () => router.back() }]
            );
            setLoading(false);
            return;
        }

        try {
            const result = await getProviderById(
                String(serviceProviderId)
            );

            setProvider(result.provider);
        } catch (error) {
            console.log(
                "Load Provider Error:",
                error?.response?.data || error.message
            );

            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                "Unable to load the service provider."
            );
        } finally {
            setLoading(false);
        }
    };

    const confirmBooking = async () => {
        if (confirmingRef.current) {
            return;
        }

        try {
            confirmingRef.current = true;
            setConfirming(true);

            const result = await createBooking(
                booking,
                customerImages
            );

            removeBookingDraft(draftKey);

            router.replace({
                pathname:
                    "/Customer/(tabs)/booking/booking-completed",
                params: {
                    bookingId: result.booking.id,
                },
            });
        } catch (error) {
            Alert.alert(
                "Booking Failed",
                error?.response?.data?.message ||
                "Unable to create booking."
            );
        } finally {
            confirmingRef.current = false;
            setConfirming(false);
        }
    };

    const cancelBooking = () => {
        removeBookingDraft(draftKey);
        router.back();
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
                <ActivityIndicator
                    size="large"
                    color="#008568"
                />
            </View>
        );
    }

    if (!provider || !booking) {
        return null;
    }

    const profile = provider;

    const providerName = `${profile?.firstName || ""} ${profile?.lastName || ""
        }`.trim();

    const hourlyRate =
        Number(profile?.hourlyRate || 0);

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
            >
                <View className="px-5 pt-12">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={cancelBooking}
                            className="h-11 w-11 items-center justify-center rounded-full bg-white"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="#1E2926"
                            />
                        </Pressable>

                        <Text className="ml-4 text-xl font-bold text-[#1E2926]">
                            Confirm Booking
                        </Text>
                    </View>

                    <View className="mt-7 items-center">
                        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#008568]">
                            <Ionicons
                                name="checkmark"
                                size={38}
                                color="white"
                            />
                        </View>

                        <Text className="mt-4 text-lg font-bold text-[#1E2926]">
                            Booking Details
                        </Text>

                        <Text className="mt-1 text-xs text-[#697873]">
                            Please check everything is correct.
                        </Text>
                    </View>

                    <View className="mt-6 rounded-[25px] bg-white p-5">
                        <Text className="text-xs font-bold text-[#697873]">
                            SERVICE PROVIDER
                        </Text>

                        <Text className="mt-2 text-lg font-bold text-[#1E2926]">
                            {providerName || "Service Provider"}
                        </Text>

                        <Text className="mt-1 text-sm text-[#697873]">
                            {profile?.serviceCategory ||
                                "Service"}
                        </Text>

                        <View className="mt-4 h-[1px] bg-[#E4EBE8]" />

                        <View className="mt-4 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                SERVICE
                            </Text>

                            <Text className="max-w-[55%] text-right text-xs text-[#697873]">
                                {profile?.serviceCategory ||
                                    "Service"}
                            </Text>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                PROBLEM
                            </Text>

                            <Text className="max-w-[55%] text-right text-xs text-[#697873]">
                                {booking.problem}
                            </Text>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                PHONE
                            </Text>

                            <Text className="text-xs text-[#697873]">
                                {booking.phoneNumber}
                            </Text>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                LOCATION
                            </Text>

                            <Text className="max-w-[55%] text-right text-xs text-[#697873]">
                                {booking.serviceLocation}
                            </Text>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                NOTE
                            </Text>

                            <Text className="max-w-[55%] text-right text-xs text-[#697873]">
                                {booking.note || "None"}
                            </Text>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-xs font-bold text-[#1E2926]">
                                IMAGES
                            </Text>

                            <Text className="text-xs text-[#697873]">
                                {customerImages.length} attached
                            </Text>
                        </View>
                    </View>

                    {customerImages.length > 0 && (
                        <View className="mt-4 rounded-[25px] bg-white p-5">
                            <Text className="font-bold text-[#1E2926]">
                                Uploaded Images
                            </Text>

                            <View className="mt-3 flex-row gap-3">
                                {customerImages.map(
                                    (image) => (
                                        <ZoomableImage key={image.uri} uri={image.uri} imageClassName="h-20 w-20 rounded-2xl" />
                                    )
                                )}
                            </View>
                        </View>
                    )}

                    {/* Display only. Not stored in Booking */}
                    <View className="mt-4 rounded-[25px] bg-white p-5">
                        <Text className="text-xs font-bold text-[#697873]">
                            HOURLY RATE
                        </Text>

                        <Text className="mt-2 text-2xl font-bold text-[#008568]">
                            Rs.{" "}
                            {hourlyRate.toLocaleString()}
                            {" / hour"}
                        </Text>

                        <Text className="mt-2 text-xs text-[#697873]">
                            This is the service provider's hourly
                            rate. It is not included in this
                            booking.
                        </Text>
                    </View>

                    <View className="mt-5 flex-row gap-3">
                        <Pressable
                            onPress={cancelBooking}
                            className="flex-1 items-center rounded-full border border-[#008568] bg-white py-4"
                        >
                            <Text className="font-bold text-[#008568]">
                                CANCEL
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={confirmBooking}
                            disabled={confirming}
                            className={`flex-1 items-center rounded-full py-4 ${confirming ? "bg-[#6FAFA0]" : "bg-[#008568]"
                                }`}
                        >
                            {confirming ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-bold text-white">
                                    CONFIRM BOOKING
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    <View className="mt-5 rounded-[22px] bg-white p-5">
                        <View className="flex-row items-center">
                            <View className="h-8 w-8 items-center justify-center rounded-full border border-[#008568]">
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color="#008568"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <Text className="font-bold text-[#1E2926]">
                                    Secure booking
                                </Text>

                                <Text className="mt-1 text-xs text-[#697873]">
                                    Your booking is saved only after
                                    you confirm it.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
