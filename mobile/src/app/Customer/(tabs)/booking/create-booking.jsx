import React, { useState } from "react";

import {
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import ScrollView from "../../../../components/common/KeyboardAwareScrollView";

import * as ImagePicker from "expo-image-picker";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import ZoomableImage from "../../../../components/common/ZoomableImage";
import { saveBookingDraft } from "../../../../../lib/booking-draft";

export default function CreateBooking() {
    const router = useRouter();

    const { serviceProviderId } =
        useLocalSearchParams();

    const [problem, setProblem] = useState("");
    const [note, setNote] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [serviceLocation, setServiceLocation] =
        useState("");

    const [images, setImages] = useState([]);

    const selectImages = async () => {
        if (images.length >= 3) {
            Alert.alert(
                "Maximum Images",
                "You can upload up to 3 images."
            );

            return;
        }

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow gallery access."
            );

            return;
        }

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                selectionLimit: 3 - images.length,
                quality: 0.8,
            });

        if (result.canceled) {
            return;
        }

        const selectedImages = result.assets.map(
            (asset, index) => ({
                uri: asset.uri,
                name:
                    asset.fileName ||
                    `booking-image-${Date.now()}-${index}.jpg`,
                type: asset.mimeType || "image/jpeg",
            })
        );

        setImages((previous) => [
            ...previous,
            ...selectedImages,
        ]);
    };

    const removeImage = (index) => {
        setImages((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };

    const submitBooking = () => {
        if (!problem.trim()) {
            Alert.alert(
                "Required",
                "Please describe your problem."
            );
            return;
        }

        if (!phoneNumber.trim()) {
            Alert.alert(
                "Required",
                "Please enter your phone number."
            );
            return;
        }

        if (!serviceLocation.trim()) {
            Alert.alert(
                "Required",
                "Please enter the service location."
            );
            return;
        }

        if (!serviceProviderId) {
            Alert.alert(
                "Error",
                "Service provider was not selected."
            );
            return;
        }

        const draftId = saveBookingDraft({
            data: {
                serviceProviderId: String(serviceProviderId),
                problem: problem.trim(),
                note: note.trim(),
                phoneNumber: phoneNumber.trim(),
                serviceLocation: serviceLocation.trim(),
            },
            images,
        });

        router.push({
            pathname:
                "/Customer/(tabs)/booking/confirm-booking",
            params: {
                draftId,
            },
        });
    };

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={{
                    paddingBottom: 180,
                }}
            >
                <View className="px-5 pt-12">
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            className="h-11 w-11 items-center justify-center rounded-full bg-white"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={22}
                                color="#1E2926"
                            />
                        </Pressable>

                        <Text className="ml-4 text-xl font-bold text-[#1E2926]">
                            Create Booking
                        </Text>
                    </View>

                    <View className="mt-7">
                        <Text className="mb-2 font-bold text-[#1E2926]">
                            What is the problem?
                        </Text>

                        <TextInput
                            value={problem}
                            onChangeText={setProblem}
                            placeholder="Describe the issue"
                            placeholderTextColor="#9AA6A2"
                            multiline
                            textAlignVertical="top"
                            className="h-32 rounded-[25px] border border-[#CBD6D2] bg-white px-5 py-4 text-[#1E2926]"
                        />
                    </View>

                    <View className="mt-5">
                        <Text className="mb-2 font-bold text-[#1E2926]">
                            Add a Note (Optional)
                        </Text>

                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Any extra instructions for the provider?"
                            placeholderTextColor="#9AA6A2"
                            multiline
                            className="h-24 rounded-[25px] border border-[#CBD6D2] bg-white px-5 py-4 text-[#1E2926]"
                        />
                    </View>

                    <View className="mt-5">
                        <Text className="mb-2 font-bold text-[#1E2926]">
                            Phone Number
                        </Text>

                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="+94 7X XXX XXXX"
                            placeholderTextColor="#9AA6A2"
                            keyboardType="phone-pad"
                            className="rounded-[25px] border border-[#CBD6D2] bg-white px-5 py-4 text-[#1E2926]"
                        />
                    </View>

                    <View className="mt-5">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-bold text-[#1E2926]">
                                Upload Images (Optional)
                            </Text>

                            <Text className="text-xs text-[#697873]">
                                {images.length}/3
                            </Text>
                        </View>

                        <View className="mt-3 flex-row gap-3">
                            {images.map((image, index) => (
                                <View
                                    key={`${image.uri}-${index}`}
                                    className="relative"
                                >
                                    <ZoomableImage uri={image.uri} imageClassName="h-24 w-24 rounded-2xl" />

                                    <Pressable
                                        onPress={() =>
                                            removeImage(index)
                                        }
                                        className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
                                    >
                                        <Ionicons
                                            name="close"
                                            size={14}
                                            color="white"
                                        />
                                    </Pressable>
                                </View>
                            ))}

                            {images.length < 3 && (
                                <Pressable
                                    onPress={selectImages}
                                    className="h-24 w-24 items-center justify-center rounded-2xl border border-[#CBD6D2] bg-white"
                                >
                                    <Ionicons
                                        name="add"
                                        size={30}
                                        color="#008568"
                                    />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    <View className="mt-5">
                        <Text className="mb-2 font-bold text-[#1E2926]">
                            Service Location
                        </Text>

                        <TextInput
                            value={serviceLocation}
                            onChangeText={setServiceLocation}
                            placeholder="Enter service location"
                            placeholderTextColor="#9AA6A2"
                            multiline
                            className="rounded-[25px] border border-[#CBD6D2] bg-white px-5 py-4 text-[#1E2926]"
                        />
                    </View>

                    <Pressable
                        onPress={submitBooking}
                        className="mt-7 items-center rounded-full bg-[#008568] py-4"
                    >
                        <Text className="font-bold text-white">
                            SUBMIT BOOKING
                        </Text>
                    </Pressable>

                    <Text className="mt-3 text-center text-xs text-[#697873]">
                        Review all booking details before confirming.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
