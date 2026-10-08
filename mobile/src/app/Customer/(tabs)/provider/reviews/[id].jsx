import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import ScrollView from "../../../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../../../../context/AuthContext";
import {
  deleteReview,
  getReviewById,
  updateReview,
} from "../../../../../../lib/review";
import {
  ReviewCard,
  ReviewForm,
} from "../../../../../components/reviews/ReviewUI";

export default function ReviewDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const reviewId = String(id || "");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  const loadReview = async () => {
    try {
      const result = await getReviewById(reviewId);
      setReview(result.review);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to load review."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async (data) => {
    if (!data.rating) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }
    if (!data.comment && data.likedTags.length === 0) {
      Alert.alert("Review Required", "Select an option or write a comment.");
      return;
    }

    try {
      setSaving(true);
      await updateReview(reviewId, data);
      setEditing(false);
      await loadReview();
      Alert.alert("Saved", "Your review has been updated.");
    } catch (error) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Review", "Delete this review permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(reviewId);
            router.back();
          } catch (error) {
            Alert.alert(
              "Delete Failed",
              error?.response?.data?.message || "Unable to delete review."
            );
          }
        },
      },
    ]);
  };

  if (loading || !review) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF]">
        <ActivityIndicator size="large" color="#008568" />
      </View>
    );
  }

  const isOwner = review.customerId === user?.id;
  const providerProfile = review.serviceProvider?.serviceProviderProfile;

  return (
    <View className="flex-1 bg-[#EAF2EF]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 180 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#12332D" />
          </Pressable>
          <Text className="text-[20px] font-bold text-[#12332D]">
            Review Details
          </Text>
          <View className="h-11 w-11" />
        </View>

        <View className="mt-5 rounded-[22px] bg-white p-4">
          <Text className="text-[14px] font-bold text-[#12332D]">
            {providerProfile
              ? `${providerProfile.firstName} ${providerProfile.lastName}`
              : "Service Provider"}
          </Text>
          <Text className="mt-1 text-[10px] text-[#82908D]">
            {providerProfile?.serviceCategory || "Service Provider"}
          </Text>
        </View>

        <View className="mt-5">
          {editing ? (
            <ReviewForm
              key={review.updatedAt || review.id}
              initialReview={review}
              loading={saving}
              submitLabel="SAVE REVIEW"
              onSubmit={saveReview}
            />
          ) : (
            <ReviewCard review={review} />
          )}
        </View>

        {isOwner && !editing ? (
          <View className="mt-3 flex-row gap-3">
            <Pressable
              onPress={() => setEditing(true)}
              className="flex-1 items-center rounded-full bg-[#008568] py-4"
            >
              <Text className="font-bold text-white">UPDATE</Text>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              className="flex-1 items-center rounded-full border border-red-500 bg-white py-4"
            >
              <Text className="font-bold text-red-500">DELETE</Text>
            </Pressable>
          </View>
        ) : null}

        {editing ? (
          <Pressable
            onPress={() => setEditing(false)}
            className="mt-3 items-center rounded-full border border-[#008568] bg-white py-4"
          >
            <Text className="font-bold text-[#008568]">CANCEL EDITING</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
