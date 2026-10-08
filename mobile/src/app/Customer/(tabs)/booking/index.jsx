// import React, {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   Text,
//   View,
// } from "react-native";

// import {
//   useFocusEffect,
//   useRouter,
// } from "expo-router";

// import { Ionicons } from "@expo/vector-icons";

// import {
//   getMyBookings,
// } from "../../../../../lib/booking";

// const STATUS_TABS = [
//   "ALL",
//   "PENDING",
//   "ACCEPTED",
//   "WORKING",
//   "REJECTED",
//   "COMPLETED",
// ];

// export default function BookingList() {
//   const router = useRouter();

//   const [bookings, setBookings] = useState([]);

//   const [selectedStatus, setSelectedStatus] =
//     useState("ALL");

//   const [loading, setLoading] = useState(true);

//   const [refreshing, setRefreshing] =
//     useState(false);

//   const loadBookings = async () => {
//     try {
//       const result = await getMyBookings();

//       setBookings(result.bookings || []);
//     } catch (error) {
//       console.log(
//         "Get Bookings Error:",
//         error?.response?.data || error.message
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadBookings();
//     }, [])
//   );

//   const refresh = () => {
//     setRefreshing(true);
//     loadBookings();
//   };

//   const filteredBookings =
//     selectedStatus === "ALL"
//       ? bookings
//       : bookings.filter(
//           (booking) =>
//             booking.status === selectedStatus
//         );

//   const openBooking = (bookingId) => {
//     router.push({
//       pathname:
//         "/Customer/(tabs)/booking/booking-details/[id]",
//       params: {
//         id: String(bookingId),
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
//         <ActivityIndicator
//           size="large"
//           color="#008568"
//         />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-[#E9EEEC]">
//       <ScrollView
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={refresh}
//             tintColor="#008568"
//           />
//         }
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{
//           paddingBottom: 30,
//         }}
//       >
//         <View className="px-5 pt-12">
//           <Text className="text-2xl font-bold text-[#1E2926]">
//             My Bookings
//           </Text>

//           <Text className="mt-1 text-sm text-[#697873]">
//             Track all your service bookings.
//           </Text>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             className="mt-5"
//           >
//             <View className="flex-row gap-2">
//               {STATUS_TABS.map((status) => {
//                 const active =
//                   selectedStatus === status;

//                 return (
//                   <Pressable
//                     key={status}
//                     onPress={() =>
//                       setSelectedStatus(status)
//                     }
//                     className={`rounded-full px-4 py-2 ${
//                       active
//                         ? "bg-[#008568]"
//                         : "bg-white"
//                     }`}
//                   >
//                     <Text
//                       className={`text-xs font-bold ${
//                         active
//                           ? "text-white"
//                           : "text-[#697873]"
//                       }`}
//                     >
//                       {status}
//                     </Text>
//                   </Pressable>
//                 );
//               })}
//             </View>
//           </ScrollView>

//           {filteredBookings.length === 0 ? (
//             <View className="mt-10 items-center rounded-[25px] bg-white p-8">
//               <Ionicons
//                 name="calendar-outline"
//                 size={40}
//                 color="#008568"
//               />

//               <Text className="mt-4 font-bold text-[#1E2926]">
//                 No bookings found
//               </Text>

//               <Text className="mt-2 text-center text-sm text-[#697873]">
//                 You don't have any bookings in
//                 this category.
//               </Text>
//             </View>
//           ) : (
//             <View className="mt-5 gap-4">
//               {filteredBookings.map(
//                 (booking) => {
//                   const provider =
//                     booking.serviceProvider
//                       ?.serviceProviderProfile;

//                   const providerName =
//                     `${provider?.firstName || ""} ${
//                       provider?.lastName || ""
//                     }`.trim();

//                   return (
//                     <Pressable
//                       key={booking.id}
//                       onPress={() =>
//                         openBooking(
//                           booking.id
//                         )
//                       }
//                       className="rounded-[25px] bg-white p-5"
//                     >
//                       <View className="flex-row items-start justify-between">
//                         <View className="flex-1">
//                           <Text className="text-lg font-bold text-[#1E2926]">
//                             {providerName ||
//                               "Service Provider"}
//                           </Text>

//                           <Text className="mt-1 text-sm text-[#697873]">
//                             {provider?.serviceCategory ||
//                               "Service"}
//                           </Text>
//                         </View>

//                         <StatusBadge
//                           status={
//                             booking.status
//                           }
//                         />
//                       </View>

//                       <View className="mt-4">
//                         <Text className="text-xs text-[#697873]">
//                           Problem
//                         </Text>

//                         <Text
//                           numberOfLines={2}
//                           className="mt-1 text-sm font-semibold text-[#1E2926]"
//                         >
//                           {booking.problem}
//                         </Text>
//                       </View>

//                       <View className="mt-4 flex-row justify-between">
//                         <View>
//                           <Text className="text-xs text-[#697873]">
//                             Location
//                           </Text>

//                           <Text
//                             numberOfLines={1}
//                             className="mt-1 max-w-[180px] text-xs text-[#1E2926]"
//                           >
//                             {
//                               booking.serviceLocation
//                             }
//                           </Text>
//                         </View>

//                         <View className="items-end">
//                           <Text className="text-xs text-[#697873]">
//                             Date
//                           </Text>

//                           <Text className="mt-1 text-xs text-[#1E2926]">
//                             {booking.createdAt
//                               ? new Date(
//                                   booking.createdAt
//                                 ).toLocaleDateString()
//                               : "-"}
//                           </Text>
//                         </View>
//                       </View>
//                     </Pressable>
//                   );
//                 }
//               )}
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// function StatusBadge({ status }) {
//   const statusText = status || "PENDING";

//   return (
//     <View className="rounded-full bg-[#E5F3EF] px-3 py-1">
//       <Text className="text-[10px] font-bold text-[#008568]">
//         {statusText}
//       </Text>
//     </View>
//   );
// }



import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    useFocusEffect,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
    getCustomerBookings,
} from "../../../../../lib/booking";

const STATUS_TABS = [
    "ALL",
    "PENDING",
    "ACCEPTED",
    "WORKING",
    "REJECTED",
    "COMPLETED",
];

export default function BookingList() {
    const router = useRouter();

    const [bookings, setBookings] = useState([]);

    const [selectedStatus, setSelectedStatus] =
        useState("ALL");

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const loadBookings = async () => {
        try {
            const result = await getCustomerBookings();

            setBookings(result.bookings || []);
        } catch (error) {
            console.log(
                "Get Bookings Error:",
                error?.response?.data || error.message
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [])
    );

    const refresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const filteredBookings =
        selectedStatus === "ALL"
            ? bookings
            : bookings.filter(
                (booking) =>
                    booking.status === selectedStatus
            );

    const openBooking = (bookingId) => {
        router.push({
            pathname:
                "/Customer/(tabs)/booking/booking-details/[id]",
            params: {
                id: String(bookingId),
            },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
                <ActivityIndicator
                    size="large"
                    color="#008568"
                />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="#008568"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 30,
                }}
            >
                <View className="px-5 pt-12">
                    <Text className="text-2xl font-bold text-[#1E2926]">
                        My Bookings
                    </Text>

                    <Text className="mt-1 text-sm text-[#697873]">
                        Track all your service bookings.
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-5"
                    >
                        <View className="flex-row gap-2">
                            {STATUS_TABS.map((status) => {
                                const active =
                                    selectedStatus === status;

                                return (
                                    <Pressable
                                        key={status}
                                        onPress={() =>
                                            setSelectedStatus(status)
                                        }
                                        className={`rounded-full px-4 py-2 ${active
                                                ? "bg-[#008568]"
                                                : "bg-white"
                                            }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold ${active
                                                    ? "text-white"
                                                    : "text-[#697873]"
                                                }`}
                                        >
                                            {status}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {filteredBookings.length === 0 ? (
                        <View className="mt-10 items-center rounded-[25px] bg-white p-8">
                            <Ionicons
                                name="calendar-outline"
                                size={40}
                                color="#008568"
                            />

                            <Text className="mt-4 font-bold text-[#1E2926]">
                                No bookings found
                            </Text>

                            <Text className="mt-2 text-center text-sm text-[#697873]">
                                You don't have any bookings in
                                this category.
                            </Text>
                        </View>
                    ) : (
                        <View className="mt-5 gap-4">
                            {filteredBookings.map(
                                (booking) => {
                                    const provider =
                                        booking.serviceProvider
                                            ?.serviceProviderProfile;

                                    const providerName =
                                        `${provider?.firstName || ""} ${provider?.lastName || ""
                                            }`.trim();

                                    return (
                                        <Pressable
                                            key={booking.id}
                                            onPress={() =>
                                                openBooking(
                                                    booking.id
                                                )
                                            }
                                            className="rounded-[25px] bg-white p-5"
                                        >
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1">
                                                    <Text className="text-lg font-bold text-[#1E2926]">
                                                        {providerName ||
                                                            "Service Provider"}
                                                    </Text>

                                                    <Text className="mt-1 text-sm text-[#697873]">
                                                        {provider?.serviceCategory ||
                                                            "Service"}
                                                    </Text>
                                                </View>

                                                <StatusBadge
                                                    status={
                                                        booking.status
                                                    }
                                                />
                                            </View>

                                            <View className="mt-4">
                                                <Text className="text-xs text-[#697873]">
                                                    Problem
                                                </Text>

                                                <Text
                                                    numberOfLines={2}
                                                    className="mt-1 text-sm font-semibold text-[#1E2926]"
                                                >
                                                    {booking.problem}
                                                </Text>
                                            </View>

                                            <View className="mt-4 flex-row justify-between">
                                                <View>
                                                    <Text className="text-xs text-[#697873]">
                                                        Location
                                                    </Text>

                                                    <Text
                                                        numberOfLines={1}
                                                        className="mt-1 max-w-[180px] text-xs text-[#1E2926]"
                                                    >
                                                        {
                                                            booking.serviceLocation
                                                        }
                                                    </Text>
                                                </View>

                                                <View className="items-end">
                                                    <Text className="text-xs text-[#697873]">
                                                        Date
                                                    </Text>

                                                    <Text className="mt-1 text-xs text-[#1E2926]">
                                                        {booking.createdAt
                                                            ? new Date(
                                                                booking.createdAt
                                                            ).toLocaleDateString()
                                                            : "-"}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function StatusBadge({ status }) {
    const statusText = status || "PENDING";

    return (
        <View className="rounded-full bg-[#E5F3EF] px-3 py-1">
            <Text className="text-[10px] font-bold text-[#008568]">
                {statusText}
            </Text>
        </View>
    );
}