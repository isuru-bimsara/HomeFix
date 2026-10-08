import React, {
  useCallback,
  useEffect,
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

import { Ionicons } from "@expo/vector-icons";

import {
  useLocalSearchParams,
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  getProviderById,
} from "../../../../../lib/provider";
import { getProviderReviews } from "../../../../../lib/review";
import {
  ReviewCard,
  Stars,
} from "../../../../components/reviews/ReviewUI";
import ZoomableImage from "../../../../components/common/ZoomableImage";

export default function ProviderDetails() {
  const router = useRouter();

  const { id } = useLocalSearchParams();

  const [provider, setProvider] =
    useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
  });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const providerId = Array.isArray(id) ? id[0] : id;
      if (providerId) {
        loadReviews(String(providerId));
      }
    }, [id])
  );

  const loadProvider = async () => {
    try {
      setLoading(true);

      const providerId = Array.isArray(id)
        ? id[0]
        : id;

      if (!providerId) {
        return;
      }

      const result =
        await getProviderById(providerId);

      if (result.success) {
        setProvider(result.provider);
      }
    } catch (error) {
      console.log(
        "Get provider details error:",
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Unable to load provider profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (providerId) => {
    try {
      const result = await getProviderReviews(providerId);
      setReviews(result.reviews || []);
      setReviewSummary(
        result.summary || { averageRating: 0, reviewCount: 0 }
      );
    } catch (error) {
      console.log(
        "Get provider reviews error:",
        error?.response?.data || error?.message || error
      );
    }
  };

  const openBooking = () => {
    const providerId = Array.isArray(id)
      ? id[0]
      : id;

    if (!providerId) {
      return;
    }

    router.push({
      pathname:
        "/Customer/(tabs)/booking/create-booking",
      params: {
        serviceProviderId:
          String(providerId),
      },
    });
  };

  const openMessage = () => {
    router.push({
      pathname: "/Customer/(tabs)/messages/[userId]",
      params: { userId: String(provider.id) },
    });
  };

  const openRating = () => {
    router.push({
      pathname: "/Customer/(tabs)/provider/reviews/create",
      params: { providerId: String(provider.id) },
    });
  };

  const openReview = (reviewId) => {
    router.push({
      pathname: "/Customer/(tabs)/provider/reviews/[id]",
      params: { id: String(reviewId) },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF]">
        <ActivityIndicator
          size="large"
          color="#008568"
        />

        <Text className="mt-3 text-[12px] text-gray-500">
          Loading provider profile...
        </Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF] px-6">
        <Ionicons
          name="person-outline"
          size={55}
          color="#8A9995"
        />

        <Text className="mt-4 text-xl font-bold text-[#12332D]">
          Provider not found
        </Text>

        <Text className="mt-2 text-center text-[12px] text-gray-500">
          This provider profile could not be loaded.
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-[#008568] px-7 py-3"
        >
          <Text className="font-bold text-white">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const fullName =
    `${provider.firstName || ""} ${
      provider.lastName || ""
    }`.trim();

  const image =
    provider.profileImageUrl ||
    provider.googleProfileImageUrl;

  return (
    <View className="flex-1 bg-[#EAF2EF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <View className="px-5 pt-5">
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#12332D"
            />
          </Pressable>

          {/* Provider header */}
          <View className="items-center rounded-[24px] bg-white px-5 py-6">
            {image ? (
              <ZoomableImage uri={image} imageClassName="h-[105px] w-[105px] rounded-full" />
            ) : (
              <View className="h-[105px] w-[105px] items-center justify-center rounded-full bg-[#E2F2ED]">
                <Ionicons
                  name="person"
                  size={52}
                  color="#008568"
                />
              </View>
            )}

            <Text className="mt-4 text-[22px] font-bold text-[#12332D]">
              {fullName || "Service Provider"}
            </Text>

            <Text className="mt-1 text-[11px] text-gray-500">
              {provider.serviceCategory ||
                "Service Provider"}
            </Text>

            {reviewSummary.reviewCount > 0 ? (
              <View className="mt-2 flex-row items-center">
                <Ionicons name="star" size={12} color="#008568" />
                <Text className="ml-1 text-[10px] font-semibold text-[#008568]">
                  {Number(reviewSummary.averageRating).toFixed(1)} ·{" "}
                  {reviewSummary.reviewCount} reviews
                </Text>
              </View>
            ) : null}

            {provider.isVerified && (
              <View className="mt-3 flex-row items-center rounded-full bg-[#E2F2ED] px-4 py-2">
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color="#008568"
                />

                <Text className="ml-1 text-[10px] font-bold text-[#008568]">
                  Verified Provider
                </Text>
              </View>
            )}

            {/* Message */}
            <Pressable
              onPress={openMessage}
              className="mt-5 w-full flex-row items-center justify-center rounded-xl border border-[#008568] py-3"
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color="#008568"
              />

              <Text className="ml-2 text-[11px] font-bold text-[#008568]">
                MESSAGE
              </Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View className="mt-4 flex-row rounded-[22px] bg-white p-4">
            <ProviderStat
              value={
                provider.experienceYears ??
                "-"
              }
              label="Years Experience"
            />

            <View className="w-px bg-gray-200" />

            <ProviderStat
              value={
                provider.serviceLocation ||
                "-"
              }
              label="Service Area"
              smallValue
            />

            <View className="w-px bg-gray-200" />

            <ProviderStat
              value={
                provider.verificationStatus ===
                "REGISTERED"
                  ? "Active"
                  : "-"
              }
              label="Status"
            />
          </View>

          {/* About */}
          <SectionCard title="About">
            <Text className="text-[12px] leading-6 text-gray-600">
              {provider.description ||
                "This provider has not added an about description yet."}
            </Text>
          </SectionCard>

          {/* Service information */}
          <SectionCard title="Service Information">
            <InfoRow
              icon="construct-outline"
              label="Service Type"
              value={
                provider.serviceCategory ||
                "Not available"
              }
            />

            <InfoRow
              icon="location-outline"
              label="Service Area"
              value={
                provider.serviceLocation ||
                "Not available"
              }
            />

            <InfoRow
              icon="cash-outline"
              label="Hourly Rate"
              value={
                provider.hourlyRate != null
                  ? `LKR ${Number(provider.hourlyRate).toLocaleString()}/hr`
                  : "Not available"
              }
            />

            <InfoRow
              icon="call-outline"
              label="Phone Number"
              value={
                provider.phoneNumber ||
                "Not available"
              }
            />

            <InfoRow
              icon="mail-outline"
              label="Email"
              value={
                provider.email ||
                "Not available"
              }
              last
            />
          </SectionCard>

          {/* Services offered */}
          <SectionCard title="Services Offered">
            {provider.serviceCategory ? (
              <View className="self-start rounded-full bg-[#E2F2ED] px-4 py-2">
                <Text className="text-[11px] font-semibold text-[#008568]">
                  {provider.serviceCategory}
                </Text>
              </View>
            ) : (
              <Text className="text-[12px] text-gray-500">
                Service information is not available yet.
              </Text>
            )}
          </SectionCard>

          {/* Availability */}
          <SectionCard title="Availability">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2ED]">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#008568"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[11px] font-semibold text-[#12332D]">
                  Availability information
                </Text>

                <Text className="mt-1 text-[10px] text-gray-500">
                  Availability is not stored in the current
                  provider profile model.
                </Text>
              </View>
            </View>
          </SectionCard>

          {/* Reviews */}
          <SectionCard title="Ratings & Reviews">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-[25px] font-bold text-[#12332D]">
                    {Number(reviewSummary.averageRating).toFixed(1)}
                  </Text>
                  <Stars value={Math.round(reviewSummary.averageRating)} size={15} />
                </View>
                <Text className="text-[9px] text-[#82908D]">
                  {reviewSummary.reviewCount} customer reviews
                </Text>
              </View>
            </View>

            {reviews.length ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onPress={() => openReview(review.id)}
                />
              ))
            ) : (
              <Text className="py-4 text-center text-[11px] text-[#82908D]">
                No reviews yet.
              </Text>
            )}

            <Pressable
              onPress={openRating}
              className="mt-2 items-center rounded-full bg-[#008568] py-3"
            >
              <Text className="text-[10px] font-bold text-white">
                GIVE RATING
              </Text>
            </Pressable>
          </SectionCard>

          {/* Recent work */}
          <SectionCard title="Recent Work">
            <View className="items-center py-5">
              <Ionicons
                name="images-outline"
                size={42}
                color="#8A9995"
              />

              <Text className="mt-3 text-center text-[11px] text-gray-500">
                Recent work images are not available in the
                current provider model.
              </Text>
            </View>
          </SectionCard>
        </View>
      </ScrollView>

      {/* Bottom booking button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-4">
        <Pressable
          onPress={openBooking}
          className="items-center rounded-xl bg-[#008568] py-4"
        >
          <Text className="text-[12px] font-bold text-white">
            BOOK PROVIDER
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProviderStat({
  value,
  label,
  smallValue = false,
}) {
  return (
    <View className="flex-1 items-center px-2">
      <Text
        numberOfLines={1}
        className={`font-bold text-[#12332D] ${
          smallValue
            ? "text-[11px]"
            : "text-[18px]"
        }`}
      >
        {value}
      </Text>

      <Text className="mt-1 text-center text-[9px] text-gray-500">
        {label}
      </Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}) {
  return (
    <View className="mt-4 rounded-[22px] bg-white p-5">
      <Text className="mb-4 text-[16px] font-bold text-[#12332D]">
        {title}
      </Text>

      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <View
      className={`flex-row ${
        last ? "" : "mb-4"
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2ED]">
        <Ionicons
          name={icon}
          size={18}
          color="#008568"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[9px] text-gray-400">
          {label}
        </Text>

        <Text className="mt-1 text-[11px] font-semibold text-[#12332D]">
          {value}
        </Text>
      </View>
    </View>
  );
}
