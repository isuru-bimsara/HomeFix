import api from "./api";
import type {
  MyProfileResponse,
  UpdateProfileData,
  ProfileImageResponse,
} from "../src/types/profile";

export async function getMyProfile() {
  const response = await api.get<MyProfileResponse>("/profile/me");

  return response.data;
}

export async function updateMyProfile(data: UpdateProfileData) {
  const response = await api.put<MyProfileResponse>(
    "/profile/me",
    data
  );

  return response.data;
}

export async function uploadProfileImage(
  uri: string,
  fileName = "profile.jpg",
  mimeType = "image/jpeg"
) {
  const formData = new FormData();

  formData.append("profileImage", {
    uri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await api.put<ProfileImageResponse>(
    "/profile/me/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function removeProfileImage() {
  const response = await api.delete<ProfileImageResponse>(
    "/profile/me/image"
  );

  return response.data;
}