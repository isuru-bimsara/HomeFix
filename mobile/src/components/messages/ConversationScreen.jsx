import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import ZoomableImage from "../common/ZoomableImage";
import {
  deleteMessage,
  getConversation,
  getBookingConversation,
  sendMessage,
  sendBookingMessage,
  updateMessage,
} from "../../../lib/message";

const QUICK_REPLIES = ["On my way", "I'm nearby", "Need more info"];

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationScreen({ participantId, bookingId, participantName }) {
  const router = useRouter();
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const [participant, setParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [removeImages, setRemoveImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = bookingId
        ? await getBookingConversation(bookingId)
        : await getConversation(participantId);
      setParticipant(result.participant || { name: participantName || "Booking chat" });
      setMessages(result.messages || []);
    } catch (error) {
      Alert.alert("Unable to open messages", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [participantId, bookingId, participantName]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission required", "Allow photo access to send images.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.slice(0, 3));
      setRemoveImages(false);
    }
  };

  const resetComposer = () => {
    setText("");
    setImages([]);
    setEditing(null);
    setRemoveImages(false);
  };

  const submit = async () => {
    if (!text.trim() && images.length === 0 && !editing) return;
    try {
      setSaving(true);
      if (editing) {
        await updateMessage(editing.id, text.trim(), images, removeImages);
      } else {
        if (bookingId) await sendBookingMessage(bookingId, text.trim(), images);
        else await sendMessage(participantId, text.trim(), images);
      }
      resetComposer();
      await load();
    } catch (error) {
      Alert.alert("Message not saved", error?.response?.data?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (message) => {
    setEditing(message);
    setText(message.messageText || "");
    setImages([]);
    setRemoveImages(false);
  };

  const remove = (message) => Alert.alert("Delete message?", "The message and its images will be removed.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      try { await deleteMessage(message.id); await load(); }
      catch (error) { Alert.alert("Unable to delete", error?.response?.data?.message || "Please try again."); }
    } },
  ]);

  const ownActions = (message) => {
    if (message.senderId !== user?.id) return;
    Alert.alert("Message options", undefined, [
      { text: "Edit", onPress: () => startEdit(message) },
      { text: "Delete", style: "destructive", onPress: () => remove(message) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-[#EAF2EF]"><ActivityIndicator color="#008568" /></View>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#EAF2EF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View className="flex-row items-center px-5 pb-4 pt-14">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={22} color="#17342F" />
        </Pressable>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-[#17342F]">{bookingId ? "Booking Messages" : `Message ${participant?.role === "CUSTOMER" ? "Customer" : "Provider"}`}</Text>
          <Text className="text-xs text-[#73827F]">{participant?.name}</Text>
        </View>
        <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#008568]">
          {participant?.profileImageUrl ? <Image source={{ uri: participant.profileImageUrl }} className="h-full w-full" /> : <Text className="font-bold text-white">{participant?.name?.slice(0, 2).toUpperCase()}</Text>}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 14 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && <Text className="mt-12 text-center text-[#7B8986]">Start your conversation.</Text>}
        {messages.map((message) => {
          const own = message.senderId === user?.id;
          return (
            <Pressable key={message.id} onLongPress={() => ownActions(message)} className={`mb-4 max-w-[78%] ${own ? "self-end" : "self-start"}`}>
              <View className={`rounded-2xl px-4 py-3 ${own ? "bg-[#008568]" : "bg-white"}`}>
                {!!message.images?.length && <View className="mb-2 flex-row flex-wrap gap-2">{message.images.map((image) => <ZoomableImage key={image.id} uri={image.imageUrl} imageClassName="h-28 w-28 rounded-xl" />)}</View>}
                {!!message.messageText && <Text className={`text-[13px] leading-5 ${own ? "text-white" : "text-[#65736F]"}`}>{message.messageText}</Text>}
              </View>
              <Text className={`mt-1 text-[10px] text-[#82908D] ${own ? "text-right" : "text-left"}`}>{formatTime(message.createdAt)}{message.isEdited ? " · Edited" : ""}{own && message.isRead ? " · Seen" : ""}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className={`px-5 pt-2 ${keyboardVisible ? "pb-2" : "pb-6"}`}>
        {!keyboardVisible && <><Text className="mb-2 font-bold text-[#17342F]">Quick Replies</Text>
        <View className="mb-3 flex-row gap-2">{QUICK_REPLIES.map((reply) => <Pressable key={reply} onPress={() => setText(reply)} className="rounded-full border border-[#CAD7D3] bg-white px-4 py-2"><Text className="text-[10px] font-semibold text-[#17342F]">{reply}</Text></Pressable>)}</View></>}
        {editing && <View className="mb-2 flex-row items-center justify-between rounded-xl bg-[#DDEAE6] px-3 py-2"><Text className="text-xs font-semibold text-[#176754]">Editing message</Text><Pressable onPress={resetComposer}><Ionicons name="close" size={20} color="#176754" /></Pressable></View>}
        {!!images.length && <ScrollView horizontal className="mb-2">{images.map((image) => <ZoomableImage key={image.uri} uri={image.uri} containerClassName="mr-2" imageClassName="h-16 w-16 rounded-lg" />)}</ScrollView>}
        {editing?.images?.length > 0 && images.length === 0 && <Pressable onPress={() => setRemoveImages(!removeImages)} className="mb-2"><Text className="text-xs font-semibold text-red-600">{removeImages ? "Keep current images" : "Remove current images"}</Text></Pressable>}
        <View className="flex-row items-center rounded-full border border-[#D2DDDA] bg-white px-3 py-2">
          <Pressable onPress={pickImages} className="p-2"><Ionicons name="image-outline" size={22} color="#008568" /></Pressable>
          <TextInput value={text} onChangeText={setText} placeholder="Type a message..." multiline className="max-h-24 flex-1 px-2 text-[13px] text-[#17342F]" />
          <Pressable disabled={saving} onPress={submit} className="h-10 w-10 items-center justify-center rounded-full bg-[#008568]">
            {saving ? <ActivityIndicator size="small" color="white" /> : <Ionicons name={editing ? "checkmark" : "send"} size={18} color="white" />}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
