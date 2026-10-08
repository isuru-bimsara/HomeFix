import api from "./api";

import type {
  AuthResponse,
  User,
} from "../src/types/auth";

export interface LoginData {
  email: string;
  password: string;
}

export interface CustomerRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  town?: string;
  homeAddress?: string;
}

export interface ProviderRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  serviceLocation?: string;
  serviceCategory?: string;
  experienceYears?: number;
  hourlyRate?: number;
  description?: string;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    {
      email: email.trim().toLowerCase(),
      password,
    }
  );

  return response.data;
}

export async function googleLoginUser(data: {
  idToken: string;
  role?: "CUSTOMER" | "SERVICE_PROVIDER";
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
}): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/google", data);
  return response.data;
}

export async function registerCustomer(
  data: CustomerRegisterData
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    {
      role: "CUSTOMER",
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber?.trim() || undefined,
      town: data.town?.trim() || undefined,
      homeAddress:
        data.homeAddress?.trim() || undefined,
    }
  );

  return response.data;
}

export async function registerProvider(
  data: ProviderRegisterData
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    {
      role: "SERVICE_PROVIDER",
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber?.trim() || undefined,
      serviceLocation:
        data.serviceLocation?.trim() || undefined,
      serviceCategory:
        data.serviceCategory?.trim() || undefined,
      experienceYears:
        data.experienceYears,
      hourlyRate: data.hourlyRate,
      description:
        data.description?.trim() || undefined,
    }
  );

  return response.data;
}

export async function verifyEmail(email: string, otp: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/verify-email", {
    email: email.trim().toLowerCase(),
    otp,
  });
  return response.data;
}

export async function resendVerificationOtp(email: string) {
  const response = await api.post("/auth/resend-verification-otp", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post("/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  const response = await api.post("/auth/reset-password", {
    email: email.trim().toLowerCase(),
    otp,
    newPassword,
  });
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}
