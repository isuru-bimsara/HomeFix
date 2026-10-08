import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import ScrollView from "../../../../../components/common/KeyboardAwareScrollView";
import * as ImagePicker from "expo-image-picker";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ZoomableImage from "../../../../../components/common/ZoomableImage";

import {
    addBookingImages,
    deleteBookingImage,
    getBookingById,
    updateBookingDetails,
} from "../../../../../../lib/booking";

export default function EditBooking() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [problem, setProblem] = useState("");
    const [note, setNote] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [serviceLocation, setServiceLocation] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            const result = await getBookingById(String(id));
            const booking = result.booking;

            if (booking.status !== "PENDING") {
                Alert.alert(
                    "Cannot Edit",
                    "Only pending bookings can be edited.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
                return;
            }

            setProblem(booking.problem || "");
            setNote(booking.note || "");
            setPhoneNumber(booking.phoneNumber || "");
            setServiceLocation(booking.serviceLocation || "");
            setExistingImages(
                booking.images?.filter(
                    (image) => image.imageType === "CUSTOMER_REQUEST"
                ) || []
            );
        } catch (error) {
            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                "Unable to load the booking.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const selectImages = async () => {
        const availableSlots =
            3 - existingImages.length - newImages.length;

        if (availableSlots <= 0) {
            Alert.alert("Maximum Images", "You can upload up to 3 images.");
            return;
        }

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permission Required", "Please allow gallery access.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: availableSlots,
            quality: 0.8,
        });

        if (result.canceled) {
            return;
        }

        const selected = result.assets.map((asset, index) => ({
            uri: asset.uri,
            name:
                asset.fileName ||
                `booking-image-${Date.now()}-${index}.jpg`,
            type: asset.mimeType || "image/jpeg",
        }));

        setNewImages((current) => [...current, ...selected]);
    };

    const removeNewImage = (index) => {
        setNewImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const removeExistingImage = (image) => {
        Alert.alert(
            "Remove Image",
            "Remove this image from the booking?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBookingImage(String(id), String(image.id));
                            setExistingImages((current) =>
                                current.filter((item) => item.id !== image.id)
                            );
                        } catch (error) {
                            Alert.alert(
                                "Remove Failed",
                                error?.response?.data?.message ||
                                "Unable to remove the image."
                            );
                        }
                    },
                },
            ]
        );
    };

    const saveBooking = async () => {
        if (!problem.trim()) {
            Alert.alert("Required", "Please describe your problem.");
            return;
        }

        if (!phoneNumber.trim()) {
            Alert.alert("Required", "Please enter your phone number.");
            return;
        }

        if (!serviceLocation.trim()) {
            Alert.alert("Required", "Please enter the service location.");
            return;
        }

        try {
            setSaving(true);
            await updateBookingDetails(String(id), {
                problem: problem.trim(),
                note: note.trim(),
                phoneNumber: phoneNumber.trim(),
                serviceLocation: serviceLocation.trim(),
            });

            if (newImages.length > 0) {
                await addBookingImages(String(id), newImages);
            }

            Alert.alert("Saved", "Booking details updated successfully.", [
                {
                    text: "OK",
                    onPress: () =>
                        router.replace({
                            pathname:
                                "/Customer/(tabs)/booking/booking-details/[id]",
                            params: { id: String(id) },
                        }),
                },
            ]);
        } catch (error) {
            Alert.alert(
                "Update Failed",
                error?.response?.data?.message ||
                "Unable to update the booking."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
                <ActivityIndicator size="large" color="#008568" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 180 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
            >
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-11 w-11 items-center justify-center rounded-full bg-white"
                    >
                        <Ionicons name="arrow-back" size={22} color="#1E2926" />
                    </Pressable>
                    <Text className="ml-4 text-xl font-bold text-[#1E2926]">
                        Edit Booking
                    </Text>
                </View>

                <BookingField
                    label="What is the problem?"
                    value={problem}
                    onChangeText={setProblem}
                    placeholder="Describe the issue"
                    multiline
                />

                <View className="mt-5">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-[#1E2926]">
                            Booking Images
                        </Text>
                        <Text className="text-xs text-[#697873]">
                            {existingImages.length + newImages.length}/3
                        </Text>
                    </View>

                    <View className="mt-3 flex-row flex-wrap gap-3">
                        {existingImages.map((image) => (
                            <BookingImagePreview
                                key={image.id}
                                uri={image.imageUrl}
                                onRemove={() => removeExistingImage(image)}
                            />
                        ))}

                        {newImages.map((image, index) => (
                            <BookingImagePreview
                                key={`${image.uri}-${index}`}
                                uri={image.uri}
                                onRemove={() => removeNewImage(index)}
                            />
                        ))}

                        {existingImages.length + newImages.length < 3 && (
                            <Pressable
                                onPress={selectImages}
                                disabled={saving}
                                className="h-24 w-24 items-center justify-center rounded-2xl border border-[#CBD6D2] bg-white"
                            >
                                <Ionicons name="add" size={30} color="#008568" />
                                <Text className="mt-1 text-[10px] text-[#697873]">Add</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
                <BookingField
                    label="Add a Note (Optional)"
                    value={note}
                    onChangeText={setNote}
                    placeholder="Any extra instructions for the provider?"
                    multiline
                />
                <BookingField
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+94 7X XXX XXXX"
                    keyboardType="phone-pad"
                />
                <BookingField
                    label="Service Location"
                    value={serviceLocation}
                    onChangeText={setServiceLocation}
                    placeholder="Enter service location"
                    multiline
                />

                <View className="mt-7 flex-row gap-3">
                    <Pressable
                        onPress={() => router.back()}
                        disabled={saving}
                        className="flex-1 items-center rounded-full border border-[#008568] bg-white py-4"
                    >
                        <Text className="font-bold text-[#008568]">CANCEL</Text>
                    </Pressable>
                    <Pressable
                        onPress={saveBooking}
                        disabled={saving}
                        className={`flex-1 items-center rounded-full py-4 ${saving ? "bg-[#6FAFA0]" : "bg-[#008568]"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-bold text-white">SAVE</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

function BookingImagePreview({ uri, onRemove }) {
    return (
        <View className="relative">
            <ZoomableImage uri={uri} imageClassName="h-24 w-24 rounded-2xl" />
            <Pressable
                onPress={onRemove}
                className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-black/60"
            >
                <Ionicons name="close" size={16} color="white" />
            </Pressable>
        </View>
    );
}

function BookingField({ label, multiline = false, ...props }) {
    return (
        <View className="mt-5">
            <Text className="mb-2 font-bold text-[#1E2926]">{label}</Text>
            <TextInput
                {...props}
                multiline={multiline}
                textAlignVertical={multiline ? "top" : "center"}
                className={`rounded-[25px] border border-[#CBD6D2] bg-white px-5 py-4 text-[#1E2926] ${multiline ? "min-h-24" : ""
                    }`}
                placeholderTextColor="#9AA6A2"
            />
        </View>
    );
}
