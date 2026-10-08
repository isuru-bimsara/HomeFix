import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, FlatList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { getConversations } from "../../../../../lib/message";

export default function MessageInbox() {
  const router = useRouter(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const result = await getConversations(); setItems(result.conversations || []); } catch (e) { Alert.alert("Unable to load messages", e?.response?.data?.message || "Please try again."); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (loading) return <View className="flex-1 items-center justify-center bg-[#EAF2EF]"><ActivityIndicator color="#008568" /></View>;
  return <View className="flex-1 bg-[#EAF2EF] px-5 pt-14"><View className="mb-5 flex-row items-center"><Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white"><Ionicons name="arrow-back" size={20} color="#17342F" /></Pressable><Text className="ml-3 text-2xl font-bold text-[#17342F]">Messages</Text></View><FlatList data={items} keyExtractor={(x) => x.participant.id} ListEmptyComponent={<Text className="mt-16 text-center text-[#74827F]">No direct messages yet.</Text>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/ServiceProvider/(tabs)/messages/[userId]", params: { userId: item.participant.id } })} className="mb-3 flex-row items-center rounded-2xl bg-white p-4"><View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#DDF4EC]">{item.participant.profileImageUrl ? <Image source={{ uri: item.participant.profileImageUrl }} className="h-full w-full" /> : <Ionicons name="person" size={22} color="#008568" />}</View><View className="ml-3 flex-1"><Text className="font-bold text-[#17342F]">{item.participant.name}</Text><Text className="mt-1 text-xs text-[#82908D]" numberOfLines={1}>{item.lastMessage.messageText || "Photo message"}</Text></View><Ionicons name="chevron-forward" size={18} color="#82908D" /></Pressable>} /></View>;
}
