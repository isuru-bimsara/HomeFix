import React, { useState } from "react";
import { Image, Modal, Pressable, StatusBar, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ZoomableImage({ uri, imageClassName = "h-24 w-24 rounded-xl", containerClassName = "", resizeMode = "cover" }) {
  const [visible, setVisible] = useState(false);
  if (!uri) return null;
  return <>
    <Pressable onPress={() => setVisible(true)} className={containerClassName} accessibilityRole="button" accessibilityLabel="Open photo full screen">
      <Image source={{ uri }} className={imageClassName} resizeMode={resizeMode} />
    </Pressable>
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setVisible(false)}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View className="flex-1 items-center justify-center bg-black">
        <Image source={{ uri }} className="h-full w-full" resizeMode="contain" />
        <Pressable onPress={() => setVisible(false)} className="absolute right-5 top-12 h-12 w-12 items-center justify-center rounded-full bg-white/95" accessibilityRole="button" accessibilityLabel="Close photo">
          <Ionicons name="close" size={27} color="#17342F" />
        </Pressable>
        <View className="absolute bottom-10 rounded-full bg-black/60 px-4 py-2"><Text className="text-xs font-semibold text-white">Tap close to return</Text></View>
      </View>
    </Modal>
  </>;
}
