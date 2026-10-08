import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import ScrollView from "../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { getMyProfile, removeProfileImage, updateMyProfile, uploadProfileImage } from "../../../../lib/profile";
import ZoomableImage from "../../../components/common/ZoomableImage";

const EMPTY_FORM = { firstName: "", lastName: "", phoneNumber: "", serviceLocation: "", serviceCategory: "", experienceYears: "", hourlyRate: "", description: "" };

export default function ProviderProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const populate = (provider) => setForm({
    firstName: provider?.firstName || "",
    lastName: provider?.lastName || "",
    phoneNumber: provider?.phoneNumber || "",
    serviceLocation: provider?.serviceLocation || "",
    serviceCategory: provider?.serviceCategory || "",
    experienceYears: provider?.experienceYears == null ? "" : String(provider.experienceYears),
    hourlyRate: provider?.hourlyRate == null ? "" : String(provider.hourlyRate),
    description: provider?.description || "",
  });

  const loadProfile = async () => {
    try {
      const result = await getMyProfile();
      if (!result.success) throw new Error("Unable to load profile.");
      const provider = result.data.serviceProviderProfile;
      setAccount(result.data.user);
      setProfile(provider);
      populate(provider);
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || error?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return Alert.alert("Required details", "First name and last name are required.");
    const years = Number(form.experienceYears);
    const rate = Number(form.hourlyRate);
    if (form.experienceYears.trim() && (!Number.isInteger(years) || years < 0)) return Alert.alert("Invalid experience", "Enter valid completed years of experience.");
    if (!form.hourlyRate.trim() || !Number.isFinite(rate) || rate < 0) return Alert.alert("Invalid hourly rate", "Enter a valid hourly rate of 0 or more.");
    try {
      setSaving(true);
      const result = await updateMyProfile({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(), phoneNumber: form.phoneNumber.trim(),
        serviceLocation: form.serviceLocation.trim(), serviceCategory: form.serviceCategory.trim(),
        experienceYears: form.experienceYears.trim() ? years : 0, hourlyRate: rate, description: form.description.trim(),
      });
      const provider = result.data.serviceProviderProfile;
      setAccount(result.data.user);
      setProfile(provider);
      populate(provider);
      setEditing(false);
      Alert.alert("Saved", "Your provider profile has been updated.");
    } catch (error) {
      Alert.alert("Update failed", error?.response?.data?.message || "Unable to update your profile.");
    } finally { setSaving(false); }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert("Permission required", "Allow photo access to select a profile picture.");
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets[0];
      setImageLoading(true);
      const upload = await uploadProfileImage(asset.uri, asset.fileName || "provider-profile.jpg", asset.mimeType || "image/jpeg");
      setAccount((current) => ({ ...current, profileImageUrl: upload.data.profileImageUrl, profileImageSource: upload.data.profileImageSource }));
      Alert.alert("Saved", "Your profile picture has been updated.");
    } catch (error) {
      Alert.alert("Upload failed", error?.response?.data?.message || "Unable to upload your picture.");
    } finally { setImageLoading(false); }
  };

  const removeImage = () => Alert.alert("Remove profile picture?", "Your current custom picture will be removed.", [
    { text: "Cancel", style: "cancel" },
    { text: "Remove", style: "destructive", onPress: async () => {
      try {
        setImageLoading(true);
        const result = await removeProfileImage();
        setAccount((current) => ({ ...current, profileImageUrl: result.data.profileImageUrl || null, profileImageSource: result.data.profileImageSource || "NONE" }));
      } catch (error) { Alert.alert("Unable to remove picture", error?.response?.data?.message || "Please try again."); }
      finally { setImageLoading(false); }
    } },
  ]);

  const handleLogout = () => Alert.alert("Log out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    { text: "Log out", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); } },
  ]);

  if (loading) return <View className="flex-1 items-center justify-center bg-[#E9F0EE]"><ActivityIndicator size="large" color="#008568" /><Text className="mt-3 text-gray-500">Loading profile...</Text></View>;
  if (!profile) return <View className="flex-1 items-center justify-center bg-[#E9F0EE] px-6"><Ionicons name="person-outline" size={50} color="#008568" /><Text className="mt-4 text-lg font-bold text-[#173A33]">Provider profile not found</Text><Pressable onPress={loadProfile} className="mt-5 rounded-xl bg-[#008568] px-7 py-3"><Text className="font-bold text-white">TRY AGAIN</Text></Pressable></View>;

  const profileImage = account?.profileImageUrl || account?.googleProfileImageUrl;
  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  return (
    <ScrollView className="flex-1 bg-[#E9F0EE]" contentContainerStyle={{ padding: 20, paddingTop: 52, paddingBottom: 180 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor="#008568" />}>
      <View className="flex-row items-center justify-between"><View><Text className="text-2xl font-bold text-[#173A33]">My Provider Profile</Text><Text className="mt-1 text-xs text-[#82908D]">Manage your public service information</Text></View><Pressable onPress={handleLogout}><Text className="text-xs font-bold text-red-700">Log out</Text></Pressable></View>

      <View className="mt-6 items-center rounded-3xl bg-white px-5 py-6">
        <View className="relative">
          {profileImage ? <ZoomableImage uri={profileImage} imageClassName="h-24 w-24 rounded-full" /> : <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-[#008568] bg-[#E2F2ED]"><Text className="text-3xl font-bold text-[#008568]">{initials}</Text></View>}
          <Pressable onPress={pickImage} disabled={imageLoading} className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-[#008568]">{imageLoading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="camera" size={16} color="white" />}</Pressable>
        </View>
        <Text className="mt-3 text-lg font-bold text-[#173A33]">{form.firstName} {form.lastName}</Text>
        <Text className="mt-1 text-xs text-[#82908D]">{account?.email}</Text>
        <View className="mt-2 rounded-full bg-[#DDF4EC] px-3 py-1"><Text className="text-[10px] font-bold text-[#008568]">{profile.verificationStatus?.replaceAll("_", " ")}</Text></View>
        {profileImage && <Pressable onPress={removeImage} disabled={imageLoading} className="mt-3"><Text className="text-xs font-semibold text-red-500">Remove photo</Text></Pressable>}
      </View>

      <View className="mt-5 flex-row items-center justify-between"><Text className="text-sm font-bold text-[#173A33]">Account Details</Text>{!editing && <Pressable onPress={() => setEditing(true)}><Text className="text-xs font-bold text-[#008568]">EDIT ALL</Text></Pressable>}</View>
      <View className="mt-3 rounded-3xl bg-white p-4">
        {editing ? <>
          <Field label="First name" icon="person-outline" value={form.firstName} onChangeText={(v) => change("firstName", v)} />
          <Field label="Last name" icon="person-outline" value={form.lastName} onChangeText={(v) => change("lastName", v)} />
          <Field label="Phone number" icon="call-outline" value={form.phoneNumber} onChangeText={(v) => change("phoneNumber", v)} keyboardType="phone-pad" />
          <Field label="Service category" icon="construct-outline" value={form.serviceCategory} onChangeText={(v) => change("serviceCategory", v)} />
          <Field label="Service location" icon="location-outline" value={form.serviceLocation} onChangeText={(v) => change("serviceLocation", v)} />
          <Field label="Experience years" icon="ribbon-outline" value={form.experienceYears} onChangeText={(v) => change("experienceYears", v)} keyboardType="number-pad" />
          <Field label="Hourly rate (LKR)" icon="cash-outline" value={form.hourlyRate} onChangeText={(v) => change("hourlyRate", v)} keyboardType="decimal-pad" />
          <Field label="Description" icon="document-text-outline" value={form.description} onChangeText={(v) => change("description", v)} multiline />
          <View className="mt-2 flex-row gap-3"><Pressable onPress={() => { populate(profile); setEditing(false); }} className="flex-1 items-center rounded-xl border border-[#D2DDDA] py-3"><Text className="font-semibold text-[#65736F]">Cancel</Text></Pressable><Pressable onPress={saveProfile} disabled={saving} className="flex-1 items-center rounded-xl bg-[#008568] py-3">{saving ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Save Changes</Text>}</Pressable></View>
        </> : <>
          <Detail icon="person-outline" label="Name" value={`${form.firstName} ${form.lastName}`} />
          <Detail icon="call-outline" label="Phone number" value={form.phoneNumber} />
          <Detail icon="construct-outline" label="Service category" value={form.serviceCategory} />
          <Detail icon="location-outline" label="Service location" value={form.serviceLocation} />
          <Detail icon="ribbon-outline" label="Experience" value={form.experienceYears ? `${form.experienceYears} years` : "Not provided"} />
          <Detail icon="cash-outline" label="Hourly rate" value={form.hourlyRate ? `LKR ${form.hourlyRate} per hour` : "Not provided"} />
          <Detail icon="document-text-outline" label="About my service" value={form.description} last />
          <Pressable onPress={() => setEditing(true)} className="mt-4 items-center rounded-xl bg-[#008568] py-3"><Text className="text-xs font-bold text-white">EDIT PROFILE</Text></Pressable>
        </>}
      </View>
      <Pressable onPress={() => router.push("/(auth)/change-password")} className="mt-4 flex-row items-center rounded-2xl bg-white p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F6F1]"><Ionicons name="lock-closed-outline" size={19} color="#008568" /></View>
        <Text className="ml-3 flex-1 text-sm font-bold text-[#173A33]">Change password</Text>
        <Ionicons name="chevron-forward" size={19} color="#008568" />
      </Pressable>
    </ScrollView>
  );
}

function Detail({ icon, label, value, last = false }) {
  return <View className={`flex-row items-start py-3 ${last ? "" : "border-b border-[#EDF2F0]"}`}><View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F1]"><Ionicons name={icon} size={18} color="#008568" /></View><View className="ml-3 flex-1"><Text className="text-[9px] text-[#82908D]">{label}</Text><Text className="mt-1 text-xs font-semibold leading-5 text-[#173A33]">{value || "Not provided"}</Text></View></View>;
}

function Field({ label, icon, value, onChangeText, keyboardType = "default", multiline = false }) {
  return <View className="mb-3 rounded-xl border border-[#D2DDDA] px-3 py-2"><View className="flex-row items-start"><Ionicons name={icon} size={18} color="#008568" style={{ marginTop: 18 }} /><View className="ml-3 flex-1"><Text className="text-[9px] text-[#82908D]">{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} textAlignVertical={multiline ? "top" : "center"} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor="#A0ADA9" className={`text-xs text-[#173A33] ${multiline ? "min-h-[72px]" : "h-10"}`} /></View></View></View>;
}
