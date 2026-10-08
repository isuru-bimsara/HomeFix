import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import ScrollView from "../../../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getProviderById } from "../../../../../../lib/provider";
import {
  createReview,
  getProviderReviews,
} from "../../../../../../lib/review";
import {
  ReviewCard,
  ReviewForm,
} from "../../../../../components/reviews/ReviewUI";
import ZoomableImage from "../../../../../components/common/ZoomableImage";

export default function CreateReview() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams();
  const id = String(providerId || "");
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPage();
  }, [id]);

  const loadPage = async () => {
    try {
      const [providerResult, reviewResult] = await Promise.all([
        getProviderById(id),
        getProviderReviews(id),
      ]);
      setProvider(providerResult.provider);
      setReviews(reviewResult.reviews || []);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (data) => {
    if (!data.rating) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!data.comment && data.likedTags.length === 0) {
      Alert.alert(
        "Review Required",
        "Select at least one option or write a comment."
      );
      return;
    }

    try {
      setSubmitting(true);
      const result = await createReview(id, data);
      router.replace({
        pathname:
          "/Customer/(tabs)/provider/reviews/[id]",
        params: { id: result.review.id },
      });
    } catch (error) {
      Alert.alert(
        "Review Failed",
        error?.response?.data?.message || "Unable to create review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !provider) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF]">
        <ActivityIndicator size="large" color="#008568" />
      </View>
    );
  }

  const name = `${provider.firstName || ""} ${provider.lastName || ""}`.trim();
  const photo = provider.profileImageUrl || provider.googleProfileImageUrl;

  return (
    <View className="flex-1 bg-[#EAF2EF]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 180 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#12332D" />
          </Pressable>
          <View className="ml-3">
            <Text className="text-[20px] font-bold text-[#12332D]">
              Rate Your Service
            </Text>
            <Text className="text-[9px] text-[#82908D]">
              Share your experience with this provider
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center rounded-[22px] bg-white p-4">
          {photo ? (
            <ZoomableImage uri={photo} imageClassName="h-12 w-12 rounded-full" />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E2F2ED]">
              <Ionicons name="person" size={22} color="#008568" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-bold text-[#12332D]">
              {name || "Service Provider"}
            </Text>
            <Text className="mt-1 text-[9px] text-[#82908D]">
              {provider.serviceCategory || "Service Provider"}
            </Text>
          </View>
          <Ionicons name="checkmark-circle-outline" size={18} color="#008568" />
        </View>

        <View className="mt-5">
          <ReviewForm
            loading={submitting}
            submitLabel="SUBMIT REVIEW"
            onSubmit={submitReview}
          />
        </View>

        <Text className="mb-3 mt-8 text-[18px] font-bold text-[#12332D]">
          Provider Reviews
        </Text>
        {reviews.length ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onPress={() =>
                router.push({
                  pathname:
                    "/Customer/(tabs)/provider/reviews/[id]",
                  params: { id: review.id },
                })
              }
            />
          ))
        ) : (
          <Text className="text-[11px] text-[#82908D]">
            No reviews yet. Be the first to rate this provider.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
