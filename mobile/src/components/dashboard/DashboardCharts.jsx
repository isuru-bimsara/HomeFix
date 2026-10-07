import React from "react";
import { Text, View } from "react-native";

export function VerticalBarChart({ data, color = "#008568" }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <View><View className="h-36 flex-row items-end justify-between border-b border-[#D9E3E0] px-1">{data.map((item) => <View key={item.label} className="h-full flex-1 items-center justify-end"><Text className="mb-1 text-[9px] font-semibold text-[#61716D]">{item.value}</Text><View style={{ height: `${Math.max(item.value ? 10 : 2, (item.value / max) * 78)}%`, backgroundColor: color }} className="w-5 rounded-t-md" /></View>)}</View><View className="mt-2 flex-row justify-between">{data.map((item) => <Text key={item.label} className="flex-1 text-center text-[9px] text-[#82908D]">{item.label}</Text>)}</View></View>;
}

export function StatusBars({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <View className="gap-4">{data.map((item) => <View key={item.label}><View className="mb-1 flex-row justify-between"><Text className="text-[10px] font-semibold text-[#52635F]">{item.label}</Text><Text className="text-[10px] font-bold text-[#17342F]">{item.value}</Text></View><View className="h-2 overflow-hidden rounded-full bg-[#E4ECE9]"><View className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color || "#008568" }} /></View></View>)}</View>;
}
