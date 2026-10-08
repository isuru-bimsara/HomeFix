import api from "./api";

export type ClaimInput = { incidentDate: string; incidentTime: string; damageType: string; damageAmount: string | number; incidentLocation: string; description: string };

export function formatClaimTime12(value: string) {
  const [rawHour, rawMinute = "00"] = String(value || "").split(":");
  const hour = Number(rawHour);
  if (!Number.isInteger(hour)) return "";
  return `${String(hour % 12 || 12).padStart(2, "0")}:${rawMinute.slice(0, 2).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function isValidClaimDateTime(data: ClaimInput) {
  return /^\d{4}-\d{2}-\d{2}$/.test(data.incidentDate) && /^(0[1-9]|1[0-2]):[0-5]\d (AM|PM)$/.test(data.incidentTime);
}

function normalizeTime(value: string) {
  const match = String(value).trim().toUpperCase().match(/^(0[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/);
  if (!match) return value;
  let hour = Number(match[1]) % 12;
  if (match[3] === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function claimForm(data: ClaimInput, images: any[] = []) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => form.append(key, key === "incidentTime" ? normalizeTime(String(value)) : String(value)));
  images.forEach((image, index) => form.append("images", { uri: image.uri, name: image.fileName || `claim-${index}.jpg`, type: image.mimeType || "image/jpeg" } as any));
  return form;
}

const multipart = { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 };
export const getMyClaims = async () => (await api.get("/insurance-claims/my")).data;
export const getMyClaim = async (id: string) => (await api.get(`/insurance-claims/${id}`)).data;
export const createClaim = async (data: ClaimInput, images: any[]) => (await api.post("/insurance-claims", claimForm(data, images), multipart)).data;
export const updateClaim = async (id: string, data: ClaimInput, images: any[] = []) => (await api.patch(`/insurance-claims/${id}`, claimForm(data, images), multipart)).data;
export const deleteClaim = async (id: string) => (await api.delete(`/insurance-claims/${id}`)).data;
export const getPartnerClaims = async () => (await api.get("/insurance-claims/partner/all")).data;
export const getPartnerClaim = async (id: string) => (await api.get(`/insurance-claims/partner/${id}`)).data;
export const approveClaim = async (id: string) => (await api.put(`/insurance-claims/partner/${id}/approve`)).data;
export const rejectClaim = async (id: string) => (await api.put(`/insurance-claims/partner/${id}/reject`)).data;
