import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import ScrollView from "../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { useAuth } from "../../../context/AuthContext";
import { getMyProfile, removeProfileImage, uploadProfileImage } from "../../../../lib/profile";
import { getMyInsurancePartnerProfile, updateMyInsurancePartnerProfile } from "../../../../lib/insurancePartnerProfile";
import ZoomableImage from "../../../components/common/ZoomableImage";

const EMPTY = { partnerName: "", companyName: "", coverageRegion: "", supportHours: "", businessEmail: "", phoneNumber: "", claimsTeam: "" };

export default function PartnerProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const populate = (value) => setForm({
    partnerName: value?.partnerName || "",
    companyName: value?.companyName || "",
    coverageRegion: value?.coverageRegion || "",
    supportHours: value?.supportHours || "",
    businessEmail: value?.businessEmail || "",
    phoneNumber: value?.phoneNumber || "",
    claimsTeam: value?.claimsTeam || "",
  });

  const loadProfile = async () => {
    try {
      const [partnerResult, commonResult] = await Promise.all([
        getMyInsurancePartnerProfile(),
        getMyProfile(),
      ]);
      setProfile(partnerResult.data);
      setAccount({ ...partnerResult.data.account, ...commonResult.data.user });
      populate(partnerResult.data);
    } catch (error) {
      Alert.alert("Unable to load profile", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.partnerName.trim()) return Alert.alert("Partner name required", "Enter the insurance partner representative's name.");
    if (!form.companyName.trim()) return Alert.alert("Company name required", "Enter your insurance company name.");
    if (form.businessEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.businessEmail.trim())) return Alert.alert("Invalid email", "Enter a valid business email address.");
    try {
      setSaving(true);
      const result = await updateMyInsurancePartnerProfile(Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()])
      ));
      setProfile((current) => ({ ...current, ...result.data }));
      populate(result.data);
      setEditing(false);
      Alert.alert("Saved", "Your insurance partner profile has been updated.");
    } catch (error) {
      Alert.alert("Update failed", error?.response?.data?.message || "Unable to update your profile.");
    } finally { setSaving(false); }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Permission required", "Allow photo access to choose a company profile image.");
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets[0];
      setImageLoading(true);
      const upload = await uploadProfileImage(asset.uri, asset.fileName || "partner-profile.jpg", asset.mimeType || "image/jpeg");
      setAccount((current) => ({ ...current, profileImageUrl: upload.data.profileImageUrl, profileImageSource: upload.data.profileImageSource }));
      Alert.alert("Saved", "Your profile image has been updated.");
    } catch (error) {
      Alert.alert("Upload failed", error?.response?.data?.message || "Unable to upload the image.");
    } finally { setImageLoading(false); }
  };

  const removeImage = () => Alert.alert("Remove profile image?", undefined, [
    { text: "Cancel", style: "cancel" },
    { text: "Remove", style: "destructive", onPress: async () => {
      try {
        setImageLoading(true);
        const result = await removeProfileImage();
        setAccount((current) => ({ ...current, profileImageUrl: result.data.profileImageUrl || null, profileImageSource: result.data.profileImageSource || "NONE" }));
      } catch (error) { Alert.alert("Unable to remove image", error?.response?.data?.message || "Please try again."); }
      finally { setImageLoading(false); }
    } },
  ]);

  const logOut = () => Alert.alert("Log out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    { text: "Log out", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); } },
  ]);

  if (loading) return <View className="flex-1 items-center justify-center bg-[#EAF2EF]"><ActivityIndicator size="large" color="#008568" /><Text className="mt-3 text-[#71807C]">Loading profile...</Text></View>;
  if (!profile) return <View className="flex-1 items-center justify-center bg-[#EAF2EF] px-6"><Ionicons name="business-outline" size={48} color="#008568" /><Text className="mt-4 text-lg font-bold text-[#17342F]">Partner profile not found</Text><Pressable onPress={loadProfile} className="mt-5 rounded-xl bg-[#008568] px-7 py-3"><Text className="font-bold text-white">TRY AGAIN</Text></Pressable></View>;

  const image = account?.profileImageUrl || account?.googleProfileImageUrl;
  const initials = (form.companyName || "Insurance Partner").split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return <ScrollView
    className="flex-1 bg-[#EAF2EF]"
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
    automaticallyAdjustKeyboardInsets
    contentContainerStyle={{ padding: 20, paddingTop: 52, paddingBottom: 180 }}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor="#008568" />}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3"><Text className="text-2xl font-bold text-[#17342F]">Partner Profile</Text><Text className="mt-1 text-xs text-[#71807C]">Manage company and contact information</Text></View>
      <Pressable onPress={logOut} className="rounded-full bg-white px-4 py-2"><Text className="text-xs font-bold text-red-700">Log out</Text></Pressable>
    </View>

    <View className="mt-6 items-center rounded-3xl bg-white px-5 py-6">
      <View className="relative">
        {image ? <ZoomableImage uri={image} imageClassName="h-24 w-24 rounded-full" /> : <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-[#008568] bg-[#DDF4EC]"><Text className="text-3xl font-bold text-[#008568]">{initials}</Text></View>}
        <Pressable onPress={pickImage} disabled={imageLoading} className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-[#008568]">{imageLoading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="camera" size={16} color="white" />}</Pressable>
      </View>
      <Text className="mt-3 text-lg font-bold text-[#17342F]">{form.companyName || "Insurance Partner"}</Text>
      <Text className="mt-1 text-xs font-semibold text-[#008568]">{form.partnerName || "Partner representative"}</Text>
      <Text className="mt-1 text-xs text-[#71807C]">{account?.email}</Text>
      <View className="mt-2 rounded-full bg-[#DDF4EC] px-3 py-1"><Text className="text-[10px] font-bold text-[#008568]">PARTNER ID · {profile.partnerId}</Text></View>
      {image && <Pressable onPress={removeImage} disabled={imageLoading} className="mt-3"><Text className="text-xs font-semibold text-red-500">Remove photo</Text></Pressable>}
    </View>

    <View className="mt-5 flex-row items-center justify-between"><Text className="text-sm font-bold text-[#17342F]">Company Details</Text>{!editing && <Pressable onPress={() => setEditing(true)}><Text className="text-xs font-bold text-[#008568]">EDIT ALL</Text></Pressable>}</View>
    <View className="mt-3 rounded-3xl bg-white p-4">
      {editing ? <>
        <Field label="Partner name" icon="person-outline" value={form.partnerName} onChangeText={(v) => change("partnerName", v)} />
        <Field label="Company name" icon="business-outline" value={form.companyName} onChangeText={(v) => change("companyName", v)} />
        <Field label="Coverage region" icon="map-outline" value={form.coverageRegion} onChangeText={(v) => change("coverageRegion", v)} />
        <Field label="Support hours" icon="time-outline" value={form.supportHours} onChangeText={(v) => change("supportHours", v)} />
        <Field label="Business email" icon="mail-outline" value={form.businessEmail} onChangeText={(v) => change("businessEmail", v)} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone number" icon="call-outline" value={form.phoneNumber} onChangeText={(v) => change("phoneNumber", v)} keyboardType="phone-pad" />
        <Field label="Claims team" icon="people-outline" value={form.claimsTeam} onChangeText={(v) => change("claimsTeam", v)} />
        <View className="mt-2 flex-row gap-3"><Pressable onPress={() => { populate(profile); setEditing(false); }} className="flex-1 items-center rounded-xl border border-[#D2DDDA] py-3"><Text className="font-semibold text-[#65736F]">Cancel</Text></Pressable><Pressable onPress={save} disabled={saving} className="flex-1 items-center rounded-xl bg-[#008568] py-3">{saving ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Save Changes</Text>}</Pressable></View>
      </> : <>
        <Detail icon="person-outline" label="Partner name" value={form.partnerName} />
        <Detail icon="business-outline" label="Company name" value={form.companyName} />
        <Detail icon="map-outline" label="Coverage region" value={form.coverageRegion} />
        <Detail icon="time-outline" label="Support hours" value={form.supportHours} />
        <Detail icon="mail-outline" label="Business email" value={form.businessEmail} />
        <Detail icon="call-outline" label="Phone number" value={form.phoneNumber} />
        <Detail icon="people-outline" label="Claims team" value={form.claimsTeam} last />
        <Pressable onPress={() => setEditing(true)} className="mt-4 items-center rounded-xl bg-[#008568] py-3"><Text className="text-xs font-bold text-white">EDIT PROFILE</Text></Pressable>
      </>}
    </View>
    <Pressable onPress={() => router.push("/(auth)/change-password")} className="mt-4 flex-row items-center rounded-2xl bg-white p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F6F1]"><Ionicons name="lock-closed-outline" size={19} color="#008568" /></View>
      <Text className="ml-3 flex-1 text-sm font-bold text-[#17342F]">Change password</Text>
      <Ionicons name="chevron-forward" size={19} color="#008568" />
    </Pressable>
  </ScrollView>;
}

function Detail({ icon, label, value, last = false }) {
  return <View className={`flex-row items-start py-3 ${last ? "" : "border-b border-[#EDF2F0]"}`}><View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F1]"><Ionicons name={icon} size={18} color="#008568" /></View><View className="ml-3 flex-1"><Text className="text-[9px] text-[#82908D]">{label}</Text><Text className="mt-1 text-xs font-semibold text-[#17342F]">{value || "Not provided"}</Text></View></View>;
}

function Field({ label, icon, value, onChangeText, keyboardType = "default", autoCapitalize = "sentences" }) {
  return <View className="mb-3 rounded-xl border border-[#D2DDDA] px-3 py-2"><View className="flex-row items-center"><Ionicons name={icon} size={18} color="#008568" /><View className="ml-3 flex-1"><Text className="text-[9px] text-[#82908D]">{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor="#A0ADA9" className="h-10 text-xs text-[#17342F]" /></View></View></View>;
}
