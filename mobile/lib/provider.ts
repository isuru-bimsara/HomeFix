import api from "./api";

export interface ServiceProvider {
  id: string;
  email: string;
  role: "SERVICE_PROVIDER";

  accountStatus: "REGISTERED" | "BANNED";

  isActive: boolean;
  isVerified: boolean;

  profileImageUrl?: string | null;
  profileImageSource?: string | null;
  googleProfileImageUrl?: string | null;

  firstName: string;
  lastName: string;

  phoneNumber?: string | null;
  serviceLocation?: string | null;
  serviceCategory?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | string | null;
  description?: string | null;

  verificationStatus: string;
}

export interface ProvidersResponse {
  success: boolean;
  count: number;
  providers: ServiceProvider[];
}

export interface ProviderResponse {
  success: boolean;
  provider: ServiceProvider;
}

export async function getProviders(
  search = ""
): Promise<ProvidersResponse> {
  const response = await api.get<ProvidersResponse>(
    "/providers",
    {
      params: search.trim()
        ? {
            search: search.trim(),
          }
        : undefined,
    }
  );

  return response.data;
}

export async function getProviderById(
  providerId: string
): Promise<ProviderResponse> {
  const response = await api.get<ProviderResponse>(
    `/providers/${providerId}`
  );

  return response.data;
}
