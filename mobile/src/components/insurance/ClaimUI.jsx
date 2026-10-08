import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ZoomableImage from "../common/ZoomableImage";

export function ClaimCard({ claim, onPress }) {
  return <Pressable onPress={onPress} className="mb-3 rounded-3xl bg-white p-4"><View className="flex-row justify-between"><Text className="text-[10px] font-bold text-[#71807C]">CLM-{claim.id.slice(0, 8).toUpperCase()}</Text><Text className={`text-[10px] font-bold ${claim.status === "REJECTED" ? "text-red-600" : "text-[#008568]"}`}>{claim.status}</Text></View><Text className="mt-3 font-bold text-[#17342F]">{claim.damageType}</Text><Text className="mt-1 text-xs text-[#71807C]">{claim.incidentDate} · {String(claim.incidentTime).slice(0, 5)}</Text><Text className="mt-2 text-sm font-bold text-[#17342F]">LKR {Number(claim.damageAmount).toLocaleString()}</Text></Pressable>;
}

export function ClaimDetails({ claim }) {
  const provider = claim.serviceProvider?.serviceProviderProfile;
  const reviewer = claim.reviewedByPartner?.insurancePartnerProfile;
  const reviewedAt = claim.reviewedAt ? new Date(claim.reviewedAt) : null;
  const reviewDate = reviewedAt && !Number.isNaN(reviewedAt.getTime()) ? reviewedAt.toLocaleDateString() : null;
  const reviewTime = reviewedAt && !Number.isNaN(reviewedAt.getTime()) ? reviewedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  return <><View className="rounded-3xl bg-white p-4"><Line label="Status" value={claim.status} /><Line label="Claimant" value={provider ? `${provider.firstName} ${provider.lastName}` : "Service Provider"} /><Line label="Damage type" value={claim.damageType} /><Line label="Amount" value={`LKR ${Number(claim.damageAmount).toLocaleString()}`} /><Line label="Incident date" value={claim.incidentDate} /><Line label="Incident time" value={String(claim.incidentTime).slice(0, 5)} /><Line label="Location" value={claim.incidentLocation} /><Line label="Description" value={claim.description} /></View>{reviewedAt&&<><Text className="mb-2 mt-5 font-bold text-[#17342F]">Claim Decision</Text><View className="rounded-3xl border border-[#C8DED7] bg-white p-4"><Line label="Decision" value={claim.status} /><Line label="Partner name" value={reviewer?.partnerName || "Insurance Partner"} /><Line label="Company" value={reviewer?.companyName} /><Line label="Partner ID" value={reviewer?.partnerId} /><Line label="Decision date" value={reviewDate} /><Line label="Decision time" value={reviewTime} /></View></>}<Text className="mb-2 mt-5 font-bold text-[#17342F]">Evidence Photos</Text><View className="flex-row flex-wrap gap-3">{claim.images?.map((image) => <ZoomableImage key={image.id} uri={image.imageUrl} imageClassName="h-24 w-24 rounded-2xl" />)}</View></>;
}

export function ClaimForm({ form, setForm, images, onPickImages, onSubmit, saving, submitLabel }) {
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const formatDate = (value) => { const digits = value.replace(/\D/g, "").slice(0, 8); return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join("-"); };
  const rawTime = String(form.incidentTime || "");
  const hasPeriod = /\s(AM|PM)$/i.test(rawTime);
  const rawClock = rawTime.replace(/\s?(AM|PM)/i, "").trim();
  const rawHour = Number(rawClock.split(":")[0]);
  const period = hasPeriod ? (rawTime.toUpperCase().includes("PM") ? "PM" : "AM") : (rawHour >= 12 ? "PM" : "AM");
  const clock = !hasPeriod && rawClock.includes(":") && Number.isInteger(rawHour)
    ? `${String(rawHour % 12 || 12).padStart(2, "0")}:${rawClock.split(":")[1]?.slice(0, 2) || "00"}`
    : rawClock;
  const setClock = (value) => { const digits = value.replace(/\D/g, "").slice(0, 4); const formatted = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits; set("incidentTime", formatted ? `${formatted} ${period}` : ""); };
  const setPeriod = (next) => set("incidentTime", clock ? `${clock} ${next}` : ` ${next}`);
  return <><Field label="Incident Date" value={form.incidentDate} onChangeText={(v) => set("incidentDate", formatDate(v))} placeholder="YYYY-MM-DD" keyboardType="number-pad" maxLength={10} /><View className="mb-4"><Text className="mb-2 text-xs font-bold text-[#17342F]">Incident Time</Text><View className="flex-row items-center"><TextInput value={clock} onChangeText={setClock} placeholder="09:56" keyboardType="number-pad" maxLength={5} className="h-13 flex-1 rounded-2xl bg-white px-4 py-4 text-sm text-[#17342F]"/><View className="ml-3 flex-row rounded-xl bg-white p-1">{["AM","PM"].map((item)=><Pressable key={item} onPress={()=>setPeriod(item)} className={`rounded-lg px-3 py-3 ${period===item?"bg-[#008568]":""}`}><Text className={`text-xs font-bold ${period===item?"text-white":"text-[#008568]"}`}>{item}</Text></Pressable>)}</View></View><Text className="mt-1 text-[9px] text-[#71807C]">Type numbers only. The colon is added automatically.</Text></View><Field label="Damage Type" value={form.damageType} onChangeText={(v) => set("damageType", v)} placeholder="e.g. Property damage" /><Field label="Estimated Amount (LKR)" value={form.damageAmount} onChangeText={(v) => set("damageAmount", v.replace(/[^0-9.]/g, ""))} keyboardType="decimal-pad" /><Field label="Incident Location" value={form.incidentLocation} onChangeText={(v) => set("incidentLocation", v)} /><Field label="What happened?" value={form.description} onChangeText={(v) => set("description", v)} multiline /><Text className="mb-2 mt-3 font-bold text-[#17342F]">Evidence Photos</Text><View className="flex-row flex-wrap gap-3">{images.map((image) => <ZoomableImage key={image.uri || image.id} uri={image.uri || image.imageUrl} imageClassName="h-24 w-24 rounded-2xl" />)}</View><Pressable onPress={onPickImages} className="mt-3 items-center rounded-xl border border-dashed border-[#9AB5AD] bg-white py-3"><Ionicons name="images-outline" size={22} color="#008568" /><Text className="mt-1 text-[9px] font-bold text-[#008568]">{images.length ? "SELECT REPLACEMENT PHOTOS" : "ADD PHOTOS"}</Text></Pressable><Pressable disabled={saving} onPress={onSubmit} className="mt-7 items-center rounded-full bg-[#008568] py-4"><Text className="font-bold text-white">{saving ? "SAVING..." : submitLabel}</Text></Pressable></>;
}

const Field = ({ label, multiline, ...props }) => <View className="mb-4"><Text className="mb-2 text-xs font-bold text-[#17342F]">{label}</Text><TextInput {...props} multiline={multiline} textAlignVertical={multiline ? "top" : "center"} className={`rounded-2xl bg-white px-4 text-sm text-[#17342F] ${multiline ? "min-h-[110px] py-4" : "h-13 py-4"}`} /></View>;
const Line = ({ label, value }) => <View className="mb-3 flex-row"><Text className="w-28 text-[10px] font-bold text-[#17342F]">{label}</Text><Text className="flex-1 text-xs leading-5 text-[#71807C]">{value || "-"}</Text></View>;
