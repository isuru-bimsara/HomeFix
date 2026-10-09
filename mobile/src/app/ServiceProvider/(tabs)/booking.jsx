// import React, { useCallback, useMemo, useState } from "react";
// import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect, useRouter } from "expo-router";
// import { getProviderBookings } from "../../../../lib/booking";

// const FILTERS = ["ALL", "PENDING", "ACCEPTED", "WORKING", "COMPLETED"];
// const nameOf = (item) => item.customer?.customerProfile ? `${item.customer.customerProfile.firstName} ${item.customer.customerProfile.lastName}` : "Customer";

// export default function ProviderBookings() {
//   const router = useRouter();
//   const [bookings, setBookings] = useState([]);
//   const [filter, setFilter] = useState("ALL");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const load = useCallback(async () => { try { const result = await getProviderBookings(); setBookings(result.bookings || []); } catch (error) { Alert.alert("Unable to load bookings", error?.response?.data?.message || "Please try again."); } finally { setLoading(false); } }, []);
//   useFocusEffect(useCallback(() => { load(); }, [load]));
//   const visible = useMemo(() => bookings.filter((item) => (filter === "ALL" || item.status === filter) && `${nameOf(item)} ${item.problem}`.toLowerCase().includes(search.toLowerCase())), [bookings, filter, search]);
//   if (loading) return <View className="flex-1 items-center justify-center bg-[#EAF2EF]"><ActivityIndicator color="#008568" /></View>;
//   return <View className="flex-1 bg-[#EAF2EF] px-5 pt-14">
//     <Text className="text-2xl font-bold text-[#17342F]">My Bookings</Text><Text className="mt-1 text-xs text-[#74827F]">Manage your service jobs</Text>
//     <View className="mt-4 flex-row items-center rounded-full bg-white px-4"><Ionicons name="search" size={18} color="#82908D" /><TextInput value={search} onChangeText={setSearch} placeholder="Search booking or customer..." className="h-12 flex-1 px-3 text-xs" /></View>
//     <FlatList horizontal data={FILTERS} keyExtractor={(x) => x} showsHorizontalScrollIndicator={false} className="my-4 max-h-10" renderItem={({ item }) => <Pressable onPress={() => setFilter(item)} className={`mr-2 rounded-full px-4 py-2 ${filter === item ? "bg-[#008568]" : "bg-white"}`}><Text className={`text-[10px] font-bold ${filter === item ? "text-white" : "text-[#17342F]"}`}>{item}</Text></Pressable>} />
//     <FlatList data={visible} keyExtractor={(item) => item.id} onRefresh={load} refreshing={loading} ListEmptyComponent={<Text className="mt-12 text-center text-[#74827F]">No bookings found.</Text>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/ServiceProvider/(tabs)/booking/[id]", params: { id: item.id } })} className="mb-4 rounded-3xl bg-white p-4">
//       <View className="flex-row justify-between"><Text className="text-[10px] font-bold text-[#74827F]">{item.id.slice(0, 8).toUpperCase()}</Text><Text className="text-[10px] font-bold text-[#008568]">{item.status}</Text></View>
//       <Text className="mt-2 font-bold text-[#17342F]">{nameOf(item)}</Text><Text className="mt-1 text-xs text-[#52635F]" numberOfLines={1}>{item.problem}</Text><Text className="mt-2 text-[10px] text-[#82908D]">{item.serviceLocation}</Text>
//       {item.scheduledDate && <Text className="mt-1 text-[10px] font-semibold text-[#008568]">{item.scheduledDate} · {String(item.scheduledTime).slice(0, 5)}</Text>}
//       <View className="mt-3 self-end rounded-full bg-[#008568] px-5 py-2"><Text className="text-[10px] font-bold text-white">VIEW</Text></View>
//     </Pressable>} />
//   </View>;
// }


import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { getProviderBookings } from "../../../../lib/booking";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "WORKING", "COMPLETED"];

const nameOf = (item) =>
  item.customer?.customerProfile
    ? `${item.customer.customerProfile.firstName} ${item.customer.customerProfile.lastName}`
    : "Customer";

export default function ProviderBookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await getProviderBookings();
      setBookings(result.bookings || []);
    } catch (error) {
      Alert.alert(
        "Unable to load bookings",
        error?.response?.data?.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(
    () =>
      bookings.filter(
        (item) =>
          (filter === "ALL" || item.status === filter) &&
          `${nameOf(item)} ${item.problem}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [bookings, filter, search]
  );

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF]">
        <ActivityIndicator color="#008568" />
      </View>
    );

  return (
    <View className="flex-1 bg-[#EAF2EF] px-5 pt-14">
      <Text className="text-2xl font-bold text-[#17342F]">
        My Bookings
      </Text>

      <Text className="mt-1 text-xs text-[#74827F]">
        Manage your service jobs
      </Text>

      <View className="mt-4 flex-row items-center rounded-full bg-white px-4">
        <Ionicons name="search" size={18} color="#82908D" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search booking or customer..."
          className="h-12 flex-1 px-3 text-xs"
        />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(x) => x}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginVertical: 14 }}
        contentContainerStyle={{
          minHeight: 48,
          paddingVertical: 5,
          paddingRight: 20,
          alignItems: "center",
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item)}
            className={`mr-2 min-h-[38px] items-center justify-center rounded-full px-5 ${
              filter === item ? "bg-[#008568]" : "bg-white"
            }`}
          >
            <Text
              className={`text-[11px] font-bold ${
                filter === item ? "text-white" : "text-[#17342F]"
              }`}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        onRefresh={load}
        refreshing={loading}
        ListEmptyComponent={
          <Text className="mt-12 text-center text-[#74827F]">
            No bookings found.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/ServiceProvider/(tabs)/booking/[id]",
                params: { id: item.id },
              })
            }
            className="mb-4 rounded-3xl bg-white p-4"
          >
            <View className="flex-row justify-between">
              <Text className="text-[10px] font-bold text-[#74827F]">
                {item.id.slice(0, 8).toUpperCase()}
              </Text>

              <Text className="text-[10px] font-bold text-[#008568]">
                {item.status}
              </Text>
            </View>

            <Text className="mt-2 font-bold text-[#17342F]">
              {nameOf(item)}
            </Text>

            <Text
              className="mt-1 text-xs text-[#52635F]"
              numberOfLines={1}
            >
              {item.problem}
            </Text>

            <Text className="mt-2 text-[10px] text-[#82908D]">
              {item.serviceLocation}
            </Text>

            {item.scheduledDate && (
              <Text className="mt-1 text-[10px] font-semibold text-[#008568]">
                {item.scheduledDate} ·{" "}
                {String(item.scheduledTime).slice(0, 5)}
              </Text>
            )}

            <View className="mt-3 self-end rounded-full bg-[#008568] px-5 py-2">
              <Text className="text-[10px] font-bold text-white">
                VIEW
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
