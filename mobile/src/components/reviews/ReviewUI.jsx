import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const REVIEW_TAGS = [
  ["PROFESSIONAL", "Professional", "checkmark"],
  ["ON_TIME", "On time", "add"],
  ["CLEAN_WORK", "Clean work", "sparkles-outline"],
  ["FRIENDLY", "Friendly", "heart-outline"],
  ["GOOD_VALUE", "Good value", "cash-outline"],
  ["SKILLED", "Skilled", "construct-outline"],
];

export function Stars({ value, onChange, size = 24 }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          className="mr-2"
        >
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color="#008568"
          />
        </Pressable>
      ))}
    </View>
  );
}

export function ReviewCard({ review, onPress }) {
  const name =
    review.customer?.name ||
    [
      review.customer?.customerProfile?.firstName,
      review.customer?.customerProfile?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Customer";

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      className="mb-3 rounded-[22px] border border-[#D2DEDA] bg-white p-5"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Stars value={review.rating} size={14} />
          <Text className="ml-1 text-[12px] font-semibold text-[#008568]">
            {Number(review.rating).toFixed(1)}
          </Text>
        </View>
        <Text className="text-[9px] text-[#82908D]">
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text className="mt-3 text-[12px] leading-5 text-[#697873]">
        {review.comment || "Customer selected positive service qualities."}
      </Text>
      <Text className="mt-3 text-[9px] text-[#82908D]">{name}</Text>
      {review.providerReply ? (
        <View className="mt-3 rounded-xl bg-[#EAF2EF] p-3">
          <Text className="text-[10px] font-bold text-[#12332D]">
            Provider reply
          </Text>
          <Text className="mt-1 text-[10px] text-[#697873]">
            {review.providerReply}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function ReviewForm({ initialReview, loading, submitLabel, onSubmit }) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [likedTags, setLikedTags] = useState(initialReview?.likedTags || []);
  const [comment, setComment] = useState(initialReview?.comment || "");

  const toggleTag = (tag) => {
    setLikedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  return (
    <View>
      <Text className="text-[15px] font-bold text-[#12332D]">
        How was your service?
      </Text>
      <Text className="mt-1 text-[10px] text-[#82908D]">
        Tap a star to rate your experience
      </Text>
      <View className="mt-3 items-center">
        <Stars value={rating} onChange={setRating} size={31} />
        <Text className="mt-1 text-[10px] font-semibold text-[#008568]">
          {rating} out of 5
        </Text>
      </View>

      <Text className="mt-6 text-[15px] font-bold text-[#12332D]">
        What did you like?
      </Text>
      <Text className="mt-1 text-[10px] text-[#82908D]">
        Choose one or more
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {REVIEW_TAGS.map(([tag, label, icon]) => {
          const selected = likedTags.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => toggleTag(tag)}
              className={`w-[31%] flex-row items-center justify-center rounded-full border py-2 ${
                selected
                  ? "border-[#008568] bg-[#008568]"
                  : "border-[#CEDAD6] bg-white"
              }`}
            >
              <Ionicons
                name={icon}
                size={11}
                color={selected ? "white" : "#12332D"}
              />
              <Text
                className={`ml-1 text-[8px] ${
                  selected ? "text-white" : "text-[#12332D]"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-6 text-[15px] font-bold text-[#12332D]">
        Write a comment
      </Text>
      <Text className="mt-1 text-[10px] text-[#82908D]">
        Tell other users about your experience
      </Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="The service was professional and arrived on time..."
        placeholderTextColor="#A0ADA9"
        multiline
        maxLength={500}
        textAlignVertical="top"
        className="mt-3 h-28 rounded-[18px] border border-[#CEDAD6] bg-white p-4 text-[11px] text-[#12332D]"
      />
      <Text className="mt-1 text-right text-[8px] text-[#82908D]">
        {comment.length} / 500 characters
      </Text>

      <Pressable
        disabled={loading}
        onPress={() => onSubmit({ rating, likedTags, comment: comment.trim() })}
        className={`mt-5 items-center rounded-full py-4 ${
          loading ? "bg-[#75B5A6]" : "bg-[#008568]"
        }`}
      >
        <Text className="text-[11px] font-bold text-white">
          {loading ? "PLEASE WAIT..." : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
