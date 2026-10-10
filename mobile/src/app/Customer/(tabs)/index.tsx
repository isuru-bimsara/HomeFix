import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { getCustomerBookings, type Booking } from "../../../../lib/booking";
import { getMyProfile } from "../../../../lib/profile";
import { getProviders, type ServiceProvider } from "../../../../lib/provider";

const SERVICE_ITEMS = [
  { label: "Plumber", icon: "water-outline" as const, color: "#3E9DC2" },
  { label: "Electrician", icon: "flash-outline" as const, color: "#F5A623" },
  { label: "Cleaner", icon: "sparkles-outline" as const, color: "#008568" },
  { label: "Other", icon: "ellipse-outline" as const, color: "#008568" },
  { label: "More", icon: "add" as const, color: "#008568" },
];

const ACTIVE_STATUS = ["PENDING", "ACCEPTED", "WORKING"];

function providerName(provider?: ServiceProvider | Booking["serviceProvider"]) {
  const profile: any = provider && "serviceProviderProfile" in provider
    ? provider.serviceProviderProfile
    : provider;
  return `${profile?.firstName || "Service"} ${profile?.lastName || "Provider"}`.trim();
}

function statusText(status?: string) {
  if (status === "WORKING") return "Work in progress";
  if (status === "ACCEPTED") return "Booking confirmed";
  return "Waiting for provider";
}

function money(value?: number | string | null) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `Rs. ${amount.toLocaleString()}` : "Rate on request";
}

export default function CustomerHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [profileResult, bookingResult, providerResult] = await Promise.all([
        getMyProfile(),
        getCustomerBookings(),
        getProviders(),
      ]);
      setProfile(profileResult.data);
      setBookings(bookingResult.bookings || []);
      setProviders((providerResult.providers || []).slice(0, 3));
    } catch (error: any) {
      Alert.alert(
        "Unable to load home page",
        error?.response?.data?.message || "Pull down to try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDashboard(); }, [loadDashboard]));

  const currentBooking = useMemo(
    () => bookings
      .filter((booking) => ACTIVE_STATUS.includes(booking.status))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())[0],
    [bookings]
  );

  const customer = profile?.customerProfile;
  const user = profile?.user;
  const firstName = customer?.firstName || "Customer";

  const openSearch = () => router.push("/Customer/(tabs)/search");
  const openBooking = (id: string) => router.push({
    pathname: "/Customer/(tabs)/booking/booking-details/[id]",
    params: { id },
  });
  const openProvider = (id: string) => router.push({
    pathname: "/Customer/(tabs)/provider/[id]",
    params: { id },
  });

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-[#EAF2EF]"><ActivityIndicator size="large" color="#008568" /></View>;
  }

  return (
    <ScrollView
      className="flex-1 bg-[#EAF2EF]"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor="#008568" />}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 32 }}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-[22px] font-bold text-[#17342F]">Good morning, {firstName}</Text>
          <Text className="mt-2 text-[11px] text-[#71807C]">What service do you need today?</Text>
        </View>
        <Pressable onPress={() => router.push("/Customer/(tabs)/profile")} className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-[#DCEDE7]">
          {user?.profileImageUrl
            ? <Image source={{ uri: user.profileImageUrl }} className="h-full w-full" />
            : <View className="h-full w-full items-center justify-center"><Ionicons name="person" size={24} color="#008568" /></View>}
        </Pressable>
      </View>

      <View className="mt-5 flex-row">
        <Pressable onPress={openSearch} className="h-12 flex-1 flex-row items-center rounded-full border border-[#CEDAD6] bg-white px-5">
          <Ionicons name="search-outline" size={17} color="#8A9995" />
          <Text className="ml-2 flex-1 text-[10px] text-[#8A9995]">Search plumber, electrician, cleaner...</Text>
        </Pressable>
        <Pressable onPress={openSearch} className="ml-3 h-12 w-12 items-center justify-center rounded-full bg-white">
          <Ionicons name="options-outline" size={19} color="#008568" />
        </Pressable>
      </View>

      <SectionTitle title="Services" action="See all" onAction={openSearch} />
      <View className="flex-row justify-between">
        {SERVICE_ITEMS.map((item) => <Pressable key={item.label} onPress={openSearch} className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#C8D8D3] bg-white"><Ionicons name={item.icon} size={19} color={item.color} /></View>
          <Text className="mt-2 text-[9px] text-[#71807C]">{item.label}</Text>
        </Pressable>)}
      </View>

      <SectionTitle title="Current Booking" />
      {currentBooking ? (
        <View className="rounded-[24px] border border-[#CAD9D5] bg-white p-5">
          <View className="flex-row items-start">
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-[#17342F]">{currentBooking.serviceProvider?.serviceProviderProfile?.serviceCategory || currentBooking.problem}</Text>
              <Text className="mt-1 text-[10px] text-[#71807C]">{providerName(currentBooking.serviceProvider)}</Text>
              <Text className="mt-1 text-[10px] text-[#71807C]">{currentBooking.scheduledDate || "Date pending"} · {currentBooking.scheduledTime || "Time pending"}</Text>
              <Text className="mt-2 text-[10px] font-bold text-[#008568]">Status: {statusText(currentBooking.status)}</Text>
            </View>
            <View className="rounded-full bg-[#DDF4EC] px-3 py-2"><Text className="text-[9px] font-bold text-[#008568]">{currentBooking.status}</Text></View>
          </View>
          <Pressable onPress={() => openBooking(currentBooking.id)} className="mt-4 self-end rounded-full bg-[#008568] px-7 py-3"><Text className="text-[10px] font-bold text-white">TRACK</Text></Pressable>
        </View>
      ) : (
        <Pressable onPress={openSearch} className="items-center rounded-[24px] border border-[#CAD9D5] bg-white px-5 py-6">
          <Ionicons name="calendar-outline" size={27} color="#008568" />
          <Text className="mt-2 font-bold text-[#17342F]">No active booking</Text>
          <Text className="mt-1 text-[10px] text-[#71807C]">Find a verified provider to get started.</Text>
        </Pressable>
      )}

      <SectionTitle title="Recommended for You" />
      <Text className="-mt-3 mb-3 text-[9px] text-[#71807C]">Based on service type, ratings and location</Text>
      {providers.length ? providers.map((provider) => (
        <Pressable key={provider.id} onPress={() => openProvider(provider.id)} className="mb-3 flex-row items-center rounded-[22px] border border-[#CAD9D5] bg-white p-4">
          <View className="h-12 w-12 overflow-hidden rounded-full bg-[#DDF4EC]">
            {provider.profileImageUrl ? <Image source={{ uri: provider.profileImageUrl }} className="h-full w-full" /> : <View className="h-full w-full items-center justify-center"><Ionicons name="person" size={22} color="#008568" /></View>}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[12px] font-bold text-[#17342F]">{providerName(provider)}</Text>
            <Text className="mt-1 text-[9px] text-[#71807C]">{provider.serviceCategory || "Home service"} · Verified</Text>
            <Text className="mt-1 text-[9px] font-bold text-[#008568]">From {money(provider.hourlyRate)}</Text>
          </View>
          <View className="rounded-full bg-[#008568] px-5 py-3"><Text className="text-[9px] font-bold text-white">VIEW</Text></View>
        </Pressable>
      )) : <Pressable onPress={openSearch} className="rounded-[22px] bg-white p-5"><Text className="text-center text-xs text-[#71807C]">Browse available providers</Text></Pressable>}

      <SectionTitle title="Quick Actions" />
      <View className="flex-row flex-wrap justify-between">
        <QuickAction icon="calendar-outline" title="My Bookings" subtitle="View upcoming services" onPress={() => router.push("/Customer/(tabs)/booking")} />
        <QuickAction icon="heart-outline" title="Saved Providers" subtitle="Your trusted workers" onPress={openSearch} />
        <QuickAction icon="warning-outline" title="Report Damage" subtitle="Submit claim evidence" onPress={() => Alert.alert("Report damage", "Please contact HomeFix support with your completed booking details.")} />
        <QuickAction icon="headset-outline" title="Support" subtitle="Booking or payment help" onPress={() => Alert.alert("HomeFix Support", "For booking, payment, or service help, contact the HomeFix support team.")} />
      </View>

      <SectionTitle title="Why HomeFix?" />
      <View className="rounded-[22px] border border-[#CAD9D5] bg-white p-5">
        {[
          "Verified service providers",
          "Ratings and reviews before booking",
          "Estimated prices before confirmation",
          "Secure service and payment flow",
        ].map((text) => <View key={text} className="mb-3 flex-row items-center"><Ionicons name="checkmark" size={13} color="#008568" /><Text className="ml-2 text-[10px] text-[#53645F]">{text}</Text></View>)}
      </View>

      <Pressable onPress={() => Alert.alert("HomeFix Support", "Tell us what you need help with and our team will assist you.")} className="mt-5 rounded-[22px] bg-[#008568] p-5">
        <Text className="text-[13px] font-bold text-white">Need help with a booking?</Text>
        <Text className="mt-1 text-[9px] text-[#D9F3EB]">Contact HomeFix support for booking, payment or service issues.</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View className="mb-4 mt-7 flex-row items-center"><Text className="flex-1 text-[16px] font-bold text-[#17342F]">{title}</Text>{action && <Pressable onPress={onAction}><Text className="text-[10px] font-bold text-[#008568]">{action}</Text></Pressable>}</View>;
}

function QuickAction({ icon, title, subtitle, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable onPress={onPress} className="mb-3 w-[48%] items-center rounded-[20px] border border-[#CAD9D5] bg-white px-3 py-5"><Ionicons name={icon} size={20} color="#008568" /><Text className="mt-2 text-[10px] font-bold text-[#17342F]">{title}</Text><Text className="mt-1 text-center text-[8px] text-[#8A9995]">{subtitle}</Text></Pressable>;
}
