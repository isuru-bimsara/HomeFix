export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  town?: string | null;
  homeAddress?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  profileImageUrl?: string | null;
  profileImageSource?: "NONE" | "GOOGLE" | "CUSTOM";
  googleProfileImageUrl?: string | null;
}

export interface ServiceProviderProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  serviceLocation?: string | null;
  serviceCategory?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | string | null;
  description?: string | null;
  verificationStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyProfileResponse {
  success: boolean;
  data: {
    user: ProfileUser;
    customerProfile: CustomerProfile | null;
    serviceProviderProfile?: ServiceProviderProfile | null;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  town?: string;
  homeAddress?: string;
  serviceLocation?: string;
  serviceCategory?: string;
  experienceYears?: number;
  hourlyRate?: number;
  description?: string;
}

export interface ProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    profileImageUrl?: string | null;
    profileImagePublicId?: string | null;
    profileImageSource?: string;
  };
}
