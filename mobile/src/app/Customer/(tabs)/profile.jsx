import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import ScrollView from "../../../components/common/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import ZoomableImage from "../../../components/common/ZoomableImage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { useAuth } from "../../../context/AuthContext";
import {
  getMyProfile,
  removeProfileImage,
  updateMyProfile,
  uploadProfileImage,
} from "../../../../lib/profile";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [town, setTown] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await getMyProfile();

      if (!result.success) {
        Alert.alert(
          "Error",
          result.message || "Unable to load profile."
        );
        return;
      }

      const customer = result.data.customerProfile;

      setUser(result.data.user);
      setProfile(customer);

      if (customer) {
        setFirstName(customer.firstName || "");
        setLastName(customer.lastName || "");
        setPhoneNumber(customer.phoneNumber || "");
        setTown(customer.town || "");
        setHomeAddress(customer.homeAddress || "");
      }
    } catch (error) {
      console.log(
        "Get profile error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert("Validation", "First name is required.");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("Validation", "Last name is required.");
      return;
    }

    try {
      setSaving(true);

      const result = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        town: town.trim(),
        homeAddress: homeAddress.trim(),
      });

      if (!result.success) {
        Alert.alert(
          "Update failed",
          result.message || "Unable to update profile."
        );
        return;
      }

      const customer = result.data.customerProfile;

      setUser(result.data.user);
      setProfile(customer);

      if (customer) {
        setFirstName(customer.firstName || "");
        setLastName(customer.lastName || "");
        setPhoneNumber(customer.phoneNumber || "");
        setTown(customer.town || "");
        setHomeAddress(customer.homeAddress || "");
      }

      setEditing(false);

      Alert.alert(
        "Success",
        "Your profile has been updated."
      );
    } catch (error) {
      console.log(
        "Update profile error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Update failed",
        error?.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to select a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        return;
      }

      setImageLoading(true);

      const uploadResult = await uploadProfileImage(
        asset.uri,
        asset.fileName || "profile.jpg",
        asset.mimeType || "image/jpeg"
      );

      if (!uploadResult.success) {
        Alert.alert(
          "Upload failed",
          uploadResult.message || "Unable to upload image."
        );
        return;
      }

      setUser((current) => ({
        ...current,
        profileImageUrl:
          uploadResult.data.profileImageUrl,
        profileImageSource:
          uploadResult.data.profileImageSource,
      }));

      Alert.alert(
        "Success",
        "Profile picture updated."
      );
    } catch (error) {
      console.log(
        "Profile image upload error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Upload failed",
        error?.response?.data?.message ||
          "Unable to upload profile picture."
      );
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      "Remove profile picture",
      "Do you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: confirmRemoveImage,
        },
      ]
    );
  };

  const confirmRemoveImage = async () => {
    try {
      setImageLoading(true);

      const result = await removeProfileImage();

      if (!result.success) {
        Alert.alert(
          "Error",
          result.message || "Unable to remove image."
        );
        return;
      }

      setUser((current) => ({
        ...current,
        profileImageUrl:
          result.data.profileImageUrl || null,
        profileImageSource:
          result.data.profileImageSource || "NONE",
      }));

      Alert.alert(
        "Success",
        "Profile picture removed."
      );
    } catch (error) {
      console.log(
        "Remove profile image error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Unable to remove profile picture."
      );
    } finally {
      setImageLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const getInitials = () => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5FAF8]">
        <ActivityIndicator
          size="large"
          color="#008568"
        />

        <Text className="mt-3 text-sm text-gray-500">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5FAF8] px-6">
        <Ionicons
          name="person-outline"
          size={50}
          color="#008568"
        />

        <Text className="mt-4 text-lg font-semibold text-[#12332D]">
          Profile not found
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          We could not find your customer profile.
        </Text>

        <Pressable
          onPress={loadProfile}
          className="mt-5 rounded-xl bg-[#008568] px-7 py-3"
        >
          <Text className="font-semibold text-white">
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const profileImage =
    user?.profileImageUrl ||
    user?.googleProfileImageUrl;

  return (
    <View className="flex-1 bg-[#F5FAF8]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#008568"
          />
        }
        contentContainerStyle={{
          paddingBottom: 180,
        }}
      >
        <View className="px-4 pt-14">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full bg-white"
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color="#12332D"
              />
            </Pressable>

            <View className="flex-1 px-3">
              <Text className="text-[18px] font-bold text-[#12332D]">
                My Profile
              </Text>

              <Text className="text-[10px] text-gray-500">
                Manage your customer information
              </Text>
            </View>

            <Pressable onPress={handleLogout}>
              <Text className="text-[13px] font-bold text-[#4B211F]">
                Log out
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="items-center px-4 pt-6">
          <View className="relative">
            {profileImage ? (
              <ZoomableImage uri={profileImage} imageClassName="h-[92px] w-[92px] rounded-full" />
            ) : (
              <View className="h-[92px] w-[92px] items-center justify-center rounded-full border-2 border-[#008568] bg-[#E5F4EF]">
                <Text className="text-[28px] font-bold text-[#008568]">
                  {getInitials()}
                </Text>
              </View>
            )}

            <Pressable onPress={handlePickImage} disabled={imageLoading} className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-[#008568]">
              {imageLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="camera"
                  size={15}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>

          <Text className="mt-2 text-[16px] font-bold text-[#12332D]">
            {firstName} {lastName}
          </Text>

          <View className="mt-1 flex-row items-center rounded-full bg-[#DDF4EC] px-3 py-1">
            <Ionicons
              name="checkmark-circle"
              size={13}
              color="#008568"
            />

            <Text className="ml-1 text-[10px] font-semibold text-[#008568]">
              Verified Customer
            </Text>
          </View>

          {profileImage && (
            <Pressable
              onPress={handleRemoveImage}
              disabled={imageLoading}
              className="mt-2"
            >
              <Text className="text-[11px] font-medium text-red-500">
                Remove photo
              </Text>
            </Pressable>
          )}
        </View>

        <View className="mt-5 px-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[13px] font-bold text-[#12332D]">
              Personal Details
            </Text>

            {!editing && (
              <Pressable
                onPress={() => setEditing(true)}
              >
                <Text className="text-[10px] font-bold text-[#008568]">
                  EDIT ALL
                </Text>
              </Pressable>
            )}
          </View>

          {editing ? (
            <View>
              <InputField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                icon="person-outline"
              />

              <InputField
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                icon="person-outline"
              />

              <InputField
                label="Phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                icon="phone-portrait-outline"
                keyboardType="phone-pad"
              />

              <InputField
                label="Town"
                value={town}
                onChangeText={setTown}
                icon="location-outline"
              />

              <InputField
                label="Home address"
                value={homeAddress}
                onChangeText={setHomeAddress}
                icon="home-outline"
                multiline
              />

              <View className="mt-2 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setEditing(false);

                    setFirstName(
                      profile.firstName || ""
                    );
                    setLastName(
                      profile.lastName || ""
                    );
                    setPhoneNumber(
                      profile.phoneNumber || ""
                    );
                    setTown(profile.town || "");
                    setHomeAddress(
                      profile.homeAddress || ""
                    );
                  }}
                  className="flex-1 items-center rounded-xl border border-gray-200 bg-white py-3"
                >
                  <Text className="font-semibold text-gray-600">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 items-center rounded-xl bg-[#008568] py-3"
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="font-semibold text-white">
                      Save Changes
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View className="flex-row gap-3">
                <ProfileCard
                  icon="person-outline"
                  label="First name"
                  value={firstName}
                  onEdit={() => setEditing(true)}
                />

                <ProfileCard
                  icon="person-outline"
                  label="Last name"
                  value={lastName}
                  onEdit={() => setEditing(true)}
                />
              </View>

              <ProfileCard
                icon="location-outline"
                label="Town"
                value={town}
                onEdit={() => setEditing(true)}
              />

              <ProfileCard
                icon="home-outline"
                label="Home address"
                value={homeAddress}
                onEdit={() => setEditing(true)}
                large
              />

              <ProfileCard
                icon="phone-portrait-outline"
                label="Phone number"
                value={phoneNumber}
                onEdit={() => setEditing(true)}
              />
            </>
          )}
        </View>

        <View className="mt-4 px-3">
          <View className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <Pressable
              onPress={() => router.push("/(auth)/change-password")}
              className="flex-row items-center"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F1]">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#008568"
                />
              </View>

              <Text className="ml-3 flex-1 text-[12px] font-semibold text-[#12332D]">
                Reset password
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#008568"
              />
            </Pressable>
          </View>
        </View>

        <View className="mt-4 px-3">
          <Text className="mb-2 text-[13px] font-bold text-[#12332D]">
            Account Actions
          </Text>

          <Pressable
            onPress={() => setEditing(true)}
            className="items-center rounded-xl bg-[#008568] py-4"
          >
            <Text className="text-[11px] font-bold text-white">
              EDIT PROFILE
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileCard({
  icon,
  label,
  value,
  onEdit,
  large = false,
}) {
  return (
    <View
      className={`mb-3 flex-1 rounded-xl border border-gray-200 bg-white px-3 ${
        large ? "min-h-[82px] py-3" : "min-h-[72px] py-3"
      }`}
    >
      <View className="flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F1]">
          <Ionicons
            name={icon}
            size={18}
            color="#008568"
          />
        </View>

        <View className="ml-2 flex-1">
          <Text className="text-[8px] text-gray-400">
            {label}
          </Text>

          <Text
            className="mt-1 text-[11px] font-semibold text-[#12332D]"
            numberOfLines={large ? 3 : 2}
          >
            {value || "Not provided"}
          </Text>
        </View>

        <Pressable
          onPress={onEdit}
          className="h-7 w-7 items-center justify-center rounded-lg border border-gray-200"
        >
          <Ionicons
            name="create-outline"
            size={14}
            color="#12332D"
          />
        </Pressable>
      </View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  multiline = false,
}) {
  return (
    <View className="mb-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
      <View className="flex-row items-start">
        <View className="mt-1 h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F1]">
          <Ionicons
            name={icon}
            size={18}
            color="#008568"
          />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[9px] text-gray-400">
            {label}
          </Text>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#A5AFAC"
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={
              multiline ? "top" : "center"
            }
            className={`mt-1 text-[12px] font-medium text-[#12332D] ${
              multiline ? "min-h-[60px]" : ""
            }`}
          />
        </View>
      </View>
    </View>
  );
}
