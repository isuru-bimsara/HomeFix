import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import ScrollView from "../../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteClaim,
  getMyClaim,
  updateClaim,
} from "../../../../../lib/insuranceClaim";
import {
  ClaimDetails,
  ClaimForm,
} from "../../../../components/insurance/ClaimUI";
export default function ProviderClaimDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const claimId = Array.isArray(id) ? id[0] : id;
  const [claim, setClaim] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const c = (await getMyClaim(claimId)).claim;
      setClaim(c);
      setForm({
        incidentDate: c.incidentDate,
        incidentTime: String(c.incidentTime).slice(0, 5),
        damageType: c.damageType,
        damageAmount: String(c.damageAmount),
        incidentLocation: c.incidentLocation,
        description: c.description,
      });
    } catch (e) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Unable to load claim.",
      );
    } finally {
      setLoading(false);
    }
  }, [claimId]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
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
  const save = async () => {
    try {
      setSaving(true);
      await updateClaim(claimId, form, images);
      setEditing(false);
      setImages([]);
      await load();
    } catch (e) {
      Alert.alert(
        "Unable to update",
        e?.response?.data?.message || "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = () =>
    Alert.alert("Delete claim?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClaim(claimId);
            router.replace("/ServiceProvider/(tabs)/insurance");
          } catch (e) {
            Alert.alert(
              "Unable to delete",
              e?.response?.data?.message || "Please try again.",
            );
          }
        },
      },
    ]);
  if (loading || !claim)
    return (
      <View className="flex-1 items-center justify-center bg-[#EAF2EF]">
        <ActivityIndicator color="#008568" />
      </View>
    );
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
      <View className="mb-5 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <Ionicons name="arrow-back" size={20} />
        </Pressable>
        <Text className="ml-3 flex-1 text-xl font-bold text-[#17342F]">
          Claim Details
        </Text>
      </View>
      {editing ? (
        <ClaimForm
          form={form}
          setForm={setForm}
          images={images.length ? images : claim.images || []}
          onPickImages={pick}
          onSubmit={save}
          saving={saving}
          submitLabel="SAVE CLAIM"
        />
      ) : (
        <>
          <ClaimDetails claim={claim} />
          {claim.status === "PENDING" && (
            <View className="mt-7 flex-row gap-3">
              <Pressable
                onPress={() => setEditing(true)}
                className="flex-1 items-center rounded-full bg-[#008568] py-4"
              >
                <Text className="font-bold text-white">EDIT</Text>
              </Pressable>
              <Pressable
                onPress={remove}
                className="flex-1 items-center rounded-full border border-red-500 py-4"
              >
                <Text className="font-bold text-red-600">DELETE</Text>
              </Pressable>
            </View>
          )}
          {claim.status !== "PENDING" && (
            <Text className="mt-8 text-center text-xl font-bold text-[#008568]">
              {claim.status}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
