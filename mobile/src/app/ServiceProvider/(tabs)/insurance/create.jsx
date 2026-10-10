import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import ScrollView from "../../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import {
  createClaim,
  isValidClaimDateTime,
} from "../../../../../lib/insuranceClaim";
import { ClaimForm } from "../../../../components/insurance/ClaimUI";

const EMPTY = {
  incidentDate: "",
  incidentTime: "",
  damageType: "",
  damageAmount: "",
  incidentLocation: "",
  description: "",
};

export default function CreateClaim() {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const pick = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!p.granted) return;

    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });

    if (!r.canceled) setImages(r.assets.slice(0, 3));
  };

  const submit = async () => {
    if (
      !form.incidentDate ||
      !form.incidentTime ||
      !form.damageType.trim() ||
      !form.damageAmount ||
      !form.incidentLocation.trim() ||
      !form.description.trim()
    ) {
      return Alert.alert(
        "Missing details",
        "Complete every claim field."
      );
    }

    if (!isValidClaimDateTime(form)) {
      return Alert.alert(
        "Invalid date or time",
        "Use a complete date such as 2026-12-25 and a valid time such as 09:56 PM."
      );
    }

    if (!images.length) {
      return Alert.alert(
        "Evidence required",
        "Add at least one damage photo."
      );
    }

    try {
      setSaving(true);

      const r = await createClaim(form, images);

      router.replace({
        pathname: "/ServiceProvider/(tabs)/insurance/[id]",
        params: { id: r.claim.id },
      });
    } catch (e) {
      Alert.alert(
        "Unable to submit claim",
        e?.response?.data?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#EAF2EF]"
      contentContainerStyle={{
        padding: 20,
        paddingTop: 52,
        paddingBottom: 180,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={20} />
        </Pressable>

        <View className="ml-3">
          <Text className="text-xl font-bold text-[#17342F]">
            Report Damage
          </Text>

          <Text className="text-[10px] text-[#71807C]">
            Insurance claim · Provider
          </Text>
        </View>
      </View>

      <ClaimForm
        form={form}
        setForm={setForm}
        images={images}
        onPickImages={pick}
        onSubmit={submit}
        saving={saving}
        submitLabel="SUBMIT INSURANCE CLAIM"
      />
    </ScrollView>
  );
}