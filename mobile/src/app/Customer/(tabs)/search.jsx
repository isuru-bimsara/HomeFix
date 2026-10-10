import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { getProviders } from "../../../../lib/provider";

export default function Search() {
  const router = useRouter();

  const [providers, setProviders] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = useCallback(
    async (searchValue = "") => {
      try {
        if (!refreshing) {
          setLoading(true);
        }

        const result = await getProviders(searchValue);

        if (result.success) {
          setProviders(result.providers || []);
        } else {
          setProviders([]);
        }
      } catch (error) {
        console.log(
          "Get providers error:",
          error?.response?.data ||
            error?.message ||
            error
        );

        setProviders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSearching(false);
      }
    },
    [refreshing]
  );

  const handleSearch = () => {
    setSearching(true);
    loadProviders(search.trim());
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProviders(search.trim());
  };

  // Open dynamic provider profile
  const openProviderDetails = (providerId) => {
    router.push({
      pathname: "/Customer/(tabs)/provider/[id]",
      params: {
        id: String(providerId),
      },
    });
  };

  // Start a booking and keep Search as the previous screen.
  const openBooking = (providerId) => {
    router.push({
      pathname: "/Customer/(tabs)/booking/create-booking",
      params: {
        serviceProviderId: String(providerId),
      },
    });
  };

  return (
    <View className="flex-1 bg-[#EAF2EF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#008568"
          />
        }
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* Header */}
        <View className="px-5 pt-5">
          <Text className="text-[23px] font-bold text-[#12332D]">
            Provider Search
          </Text>

          <Text className="mt-1 text-[11px] text-gray-500">
            Find a trusted professional near you
          </Text>

          {/* Search */}
          <View className="mt-5 flex-row">
            <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-white px-4">
              <Ionicons
                name="search-outline"
                size={17}
                color="#9AA5A1"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                placeholder="Search electrician..."
                placeholderTextColor="#A5AFAC"
                className="ml-2 flex-1 py-3 text-[12px] text-[#12332D]"
                returnKeyType="search"
              />
            </View>

            <Pressable
              onPress={handleSearch}
              className="ml-2 items-center justify-center rounded-full bg-[#008568] px-5"
            >
              {searching ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text className="text-[11px] font-bold text-white">
                  Search
                </Text>
              )}
            </Pressable>
          </View>

          {/* Filters */}
          <View className="mt-3 flex-row">
            <FilterButton
              title="All"
              active={search === ""}
              onPress={() => {
                setSearch("");
                loadProviders("");
              }}
            />

            <FilterButton
              title="Nearby"
              onPress={() => {
                console.log(
                  "Nearby filter is not available yet."
                );
              }}
            />

            <FilterButton
              title="Top Rated"
              onPress={() => {
                console.log(
                  "Top Rated filter is not available yet."
                );
              }}
            />
          </View>

          {/* Provider count */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-[#12332D]">
              Available Providers
            </Text>

            <Text className="text-[9px] font-bold text-[#008568]">
              {providers.length} PROVIDERS
            </Text>
          </View>
        </View>

        {/* Providers */}
        <View className="mt-3 px-4">
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator
                size="large"
                color="#008568"
              />

              <Text className="mt-3 text-[12px] text-gray-500">
                Loading providers...
              </Text>
            </View>
          ) : providers.length === 0 ? (
            <EmptyProviders />
          ) : (
            providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onViewDetails={() =>
                  openProviderDetails(provider.id)
                }
                onBook={() =>
                  openBooking(provider.id)
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FilterButton({
  title,
  active = false,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full px-4 py-2 ${
        active
          ? "bg-[#008568]"
          : "bg-white"
      }`}
    >
      <Text
        className={`text-[10px] font-semibold ${
          active
            ? "text-white"
            : "text-gray-600"
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function ProviderCard({
  provider,
  onViewDetails,
  onBook,
}) {
  const fullName =
    `${provider.firstName || ""} ${
      provider.lastName || ""
    }`.trim();

  const image =
    provider.profileImageUrl ||
    provider.googleProfileImageUrl;

  const providerType =
    provider.serviceCategory ||
    "Service Provider";

  const location =
    provider.serviceLocation ||
    "Location unavailable";

  return (
    <View className="mb-3 rounded-[22px] bg-white px-4 py-4">
      <View className="flex-row">
        {/* Provider image */}
        <View className="h-[88px] w-[72px] items-center justify-center overflow-hidden rounded-xl bg-[#F2F5F4]">
          {image ? (
            <Image
              source={{ uri: image }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Ionicons
                name="person"
                size={35}
                color="#008568"
              />

              <Text className="text-[7px] text-gray-400">
                No Photo
              </Text>
            </View>
          )}
        </View>

        {/* Provider information */}
        <View className="ml-3 flex-1">
          <Text
            className="text-[13px] font-bold text-[#12332D]"
            numberOfLines={1}
          >
            {fullName || "Service Provider"}
          </Text>

          <Text
            className="mt-1 text-[9px] text-gray-400"
            numberOfLines={1}
          >
            {providerType}
          </Text>

          {/* Location */}
          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={11}
              color="#008568"
            />

            <Text
              className="ml-1 flex-1 text-[9px] text-gray-500"
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>

          {/* Experience */}
          <View className="mt-1 flex-row items-center">
            <Ionicons
              name="briefcase-outline"
              size={11}
              color="#008568"
            />

            <Text className="ml-1 text-[9px] text-gray-500">
              {provider.experienceYears ?? 0}{" "}
              years experience
            </Text>
          </View>

          {/* Hourly rate */}
          <View className="mt-1 flex-row items-center">
            <Ionicons
              name="cash-outline"
              size={11}
              color="#008568"
            />

            <Text className="ml-1 text-[9px] text-gray-500">
              {provider.hourlyRate != null
                ? `LKR ${Number(provider.hourlyRate).toLocaleString()}/hr`
                : "Rate not available"}
            </Text>
          </View>

          {/* Verification */}
          <View className="mt-1 flex-row items-center">
            <Ionicons
              name={
                provider.isVerified
                  ? "checkmark-circle"
                  : "information-circle-outline"
              }
              size={11}
              color="#008568"
            />

            <Text className="ml-1 text-[9px] text-gray-500">
              {provider.isVerified
                ? "Verified provider"
                : "Registered provider"}
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-3 flex-row">
        <Pressable
          onPress={onViewDetails}
          className="flex-1 items-center rounded-full bg-[#E2F2ED] py-2.5"
        >
          <Text className="text-[10px] font-bold text-[#008568]">
            View Details
          </Text>
        </Pressable>

        <Pressable
          onPress={onBook}
          className="ml-2 flex-1 items-center rounded-full bg-[#008568] py-2.5"
        >
          <Text className="text-[10px] font-bold text-white">
            Book Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyProviders() {
  return (
    <View className="items-center rounded-2xl bg-white px-6 py-12">
      <Ionicons
        name="people-outline"
        size={45}
        color="#008568"
      />

      <Text className="mt-3 text-[15px] font-bold text-[#12332D]">
        No providers found
      </Text>

      <Text className="mt-1 text-center text-[11px] text-gray-500">
        Try another service category or provider name.
      </Text>
    </View>
  );
}
