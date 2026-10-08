import api from "./api";

export type InsurancePartnerProfile = {
  id: string;
  partnerId: string;
  partnerName?: string | null;
  companyName?: string | null;
  coverageRegion?: string | null;
  supportHours?: string | null;
  businessEmail?: string | null;
  phoneNumber?: string | null;
  claimsTeam?: string | null;
  account?: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    accountStatus: string;
  };
};

export type InsurancePartnerProfileInput = Pick<
  InsurancePartnerProfile,
  "partnerName" | "companyName" | "coverageRegion" | "supportHours" | "businessEmail" | "phoneNumber" | "claimsTeam"
>;

export async function getMyInsurancePartnerProfile() {
  return (await api.get<{ success: boolean; data: InsurancePartnerProfile }>(
    "/auth/me/insurance-partner-profile"
  )).data;
}

export async function updateMyInsurancePartnerProfile(data: InsurancePartnerProfileInput) {
  return (await api.put<{ success: boolean; message: string; data: InsurancePartnerProfile }>(
    "/auth/me/insurance-partner-profile",
    data
  )).data;
}
