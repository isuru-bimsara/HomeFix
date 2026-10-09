


// import React, {
//   useEffect,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Pressable,
//   ScrollView,
//   Text,
//   View,
// } from "react-native";

// import {
//   useLocalSearchParams,
//   useRouter,
// } from "expo-router";

// import { Ionicons } from "@expo/vector-icons";

// import {
//   getBookingById,
//   deleteBooking,
// } from "../../../../../../lib/booking";

// export default function BookingDetails() {
//   const router = useRouter();

//   const { id } =
//     useLocalSearchParams();

//   const [booking, setBooking] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [deleting, setDeleting] =
//     useState(false);

//   useEffect(() => {
//     loadBooking();
//   }, [id]);

//   const loadBooking = async () => {
//     try {
//       const result =
//         await getBookingById(
//           String(id)
//         );

//       setBooking(result.booking);
//     } catch (error) {
//       console.log(
//         "Booking Details Error:",
//         error?.response?.data ||
//           error.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteBooking = () => {
//     if (!booking) {
//       return;
//     }

//     if (booking.status !== "PENDING") {
//       Alert.alert(
//         "Cannot Delete",
//         "Only pending bookings can be deleted."
//       );

//       return;
//     }

//     Alert.alert(
//       "Delete Booking",
//       "Are you sure you want to delete this booking?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setDeleting(true);

//               await deleteBooking(
//                 String(id)
//               );

//               Alert.alert(
//                 "Booking Deleted",
//                 "Your booking has been deleted successfully.",
//                 [
//                   {
//                     text: "OK",
//                     onPress: () => {
//                       router.replace(
//                         "/Customer/(tabs)/booking"
//                       );
//                     },
//                   },
//                 ]
//               );
//             } catch (error) {
//               console.log(
//                 "Delete Booking Error:",
//                 error?.response?.data ||
//                   error.message
//               );

//               Alert.alert(
//                 "Delete Failed",
//                 error?.response?.data?.message ||
//                   "Unable to delete the booking."
//               );
//             } finally {
//               setDeleting(false);
//             }
//           },
//         },
//       ]
//     );
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

//   if (!booking) {
//     return (
//       <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
//         <Text className="font-bold text-[#1E2926]">
//           Booking not found
//         </Text>
//       </View>
//     );
//   }

//   const provider =
//     booking.serviceProvider
//       ?.serviceProviderProfile;

//   const customer =
//     booking.customer?.customerProfile;

//   const providerName =
//     `${provider?.firstName || ""} ${
//       provider?.lastName || ""
//     }`.trim();

//   const customerName =
//     `${customer?.firstName || ""} ${
//       customer?.lastName || ""
//     }`.trim();

//   const customerImages =
//     booking.images?.filter(
//       (image) =>
//         image.imageType ===
//         "CUSTOMER_REQUEST"
//     ) || [];

//   const completionImages =
//     booking.images?.filter(
//       (image) =>
//         image.imageType ===
//         "COMPLETION"
//     ) || [];

//   return (
//     <View className="flex-1 bg-[#E9EEEC]">
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{
//           paddingBottom: 40,
//         }}
//       >
//         <View className="px-5 pt-12">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center">
//               <Pressable
//                 onPress={() =>
//                   router.back()
//                 }
//                 className="h-11 w-11 items-center justify-center rounded-full bg-white"
//               >
//                 <Ionicons
//                   name="arrow-back"
//                   size={22}
//                   color="#1E2926"
//                 />
//               </Pressable>

//               <View className="ml-4">
//                 <Text className="text-xl font-bold text-[#1E2926]">
//                   Booking Details
//                 </Text>

//                 <Text className="mt-1 text-[10px] text-[#697873]">
//                   Booking ID:{" "}
//                   {booking.id.slice(0, 8)}
//                 </Text>
//               </View>
//             </View>

//             <StatusBadge
//               status={booking.status}
//             />
//           </View>

//           <StatusProgress
//             status={booking.status}
//           />

//           <View className="mt-5 rounded-[25px] bg-white p-5">
//             <Text className="text-lg font-bold text-[#1E2926]">
//               Service Provider
//             </Text>

//             <Text className="mt-3 text-lg font-bold text-[#1E2926]">
//               {providerName ||
//                 "Service Provider"}
//             </Text>

//             <Text className="mt-1 text-sm text-[#697873]">
//               {provider?.serviceCategory ||
//                 "Service"}
//             </Text>

//             {provider?.serviceLocation && (
//               <Text className="mt-1 text-xs text-[#697873]">
//                 {provider.serviceLocation}
//               </Text>
//             )}
//           </View>

//           <View className="mt-5 rounded-[25px] bg-white p-5">
//             <Text className="text-lg font-bold text-[#1E2926]">
//               Customer
//             </Text>

//             <Text className="mt-3 font-bold text-[#1E2926]">
//               {customerName ||
//                 "Customer"}
//             </Text>

//             <Text className="mt-1 text-sm text-[#697873]">
//               {booking.phoneNumber}
//             </Text>
//           </View>

//           <View className="mt-5 rounded-[25px] bg-white p-5">
//             <Text className="text-lg font-bold text-[#1E2926]">
//               Job Details
//             </Text>

//             <DetailRow
//               label="Service"
//               value={
//                 provider?.serviceCategory ||
//                 "Service"
//               }
//             />

//             <DetailRow
//               label="Problem"
//               value={
//                 booking.problem
//               }
//             />

//             <DetailRow
//               label="Date"
//               value={
//                 booking.createdAt
//                   ? new Date(
//                       booking.createdAt
//                     ).toLocaleDateString()
//                   : "-"
//               }
//             />

//             <DetailRow
//               label="Address"
//               value={
//                 booking.serviceLocation
//               }
//             />

//             <DetailRow
//               label="Note"
//               value={
//                 booking.note || "-"
//               }
//             />
//           </View>

//           <View className="mt-5 rounded-[25px] bg-white p-5">
//             <Text className="text-lg font-bold text-[#1E2926]">
//               Attached Photos
//             </Text>

//             {customerImages.length ===
//             0 ? (
//               <Text className="mt-3 text-sm text-[#697873]">
//                 No customer photos.
//               </Text>
//             ) : (
//               <View className="mt-4 flex-row flex-wrap gap-3">
//                 {customerImages.map(
//                   (image) => (
//                     <Image
//                       key={image.id}
//                       source={{
//                         uri: image.imageUrl,
//                       }}
//                       className="h-24 w-24 rounded-2xl"
//                     />
//                   )
//                 )}
//               </View>
//             )}
//           </View>

//           {booking.status ===
//             "COMPLETED" && (
//             <View className="mt-5 rounded-[25px] bg-white p-5">
//               <Text className="text-lg font-bold text-[#1E2926]">
//                 Completion Photos
//               </Text>

//               {completionImages.length ===
//               0 ? (
//                 <Text className="mt-3 text-sm text-[#697873]">
//                   No completion photos.
//                 </Text>
//               ) : (
//                 <View className="mt-4 flex-row flex-wrap gap-3">
//                   {completionImages.map(
//                     (image) => (
//                       <Image
//                         key={image.id}
//                         source={{
//                           uri: image.imageUrl,
//                         }}
//                         className="h-24 w-24 rounded-2xl"
//                       />
//                     )
//                   )}
//                 </View>
//               )}

//               {booking.providerNote && (
//                 <View className="mt-4">
//                   <Text className="text-xs font-bold text-[#697873]">
//                     PROVIDER NOTE
//                   </Text>

//                   <Text className="mt-2 text-sm text-[#1E2926]">
//                     {
//                       booking.providerNote
//                     }
//                   </Text>
//                 </View>
//               )}
//             </View>
//           )}

//           {booking.status ===
//             "REJECTED" && (
//             <View className="mt-5 rounded-[25px] bg-white p-5">
//               <Text className="text-lg font-bold text-red-600">
//                 Booking Rejected
//               </Text>

//               {booking.providerNote && (
//                 <Text className="mt-3 text-sm text-[#697873]">
//                   {
//                     booking.providerNote
//                   }
//                 </Text>
//               )}
//             </View>
//           )}

//           {booking.status !==
//             "REJECTED" && (
//             <Text className="mt-8 text-center text-xl font-bold text-[#008568]">
//               {booking.status}
//             </Text>
//           )}

//           {/* DELETE BOOKING */}
//           {booking.status ===
//             "PENDING" && (
//             <Pressable
//               onPress={
//                 handleDeleteBooking
//               }
//               disabled={deleting}
//               className={`mt-6 flex-row items-center justify-center rounded-2xl py-4 ${
//                 deleting
//                   ? "bg-red-300"
//                   : "bg-red-500"
//               }`}
//             >
//               {deleting ? (
//                 <ActivityIndicator
//                   size="small"
//                   color="white"
//                 />
//               ) : (
//                 <Ionicons
//                   name="trash-outline"
//                   size={20}
//                   color="white"
//                 />
//               )}

//               <Text className="ml-2 font-bold text-white">
//                 {deleting
//                   ? "Deleting..."
//                   : "Delete Booking"}
//               </Text>
//             </Pressable>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// function DetailRow({
//   label,
//   value,
// }) {
//   return (
//     <View className="mt-4 flex-row justify-between gap-4">
//       <Text className="w-20 text-xs font-bold text-[#1E2926]">
//         {label}
//       </Text>

//       <Text className="flex-1 text-right text-xs text-[#697873]">
//         {value}
//       </Text>
//     </View>
//   );
// }

// function StatusBadge({ status }) {
//   return (
//     <View className="rounded-full bg-[#E5F3EF] px-3 py-2">
//       <Text className="text-[9px] font-bold text-[#008568]">
//         {status}
//       </Text>
//     </View>
//   );
// }

// function StatusProgress({
//   status,
// }) {
//   const steps = [
//     "ACCEPTED",
//     "WORKING",
//     "COMPLETED",
//   ];

//   const rejected =
//     status === "REJECTED";

//   if (rejected) {
//     return (
//       <View className="mt-5 rounded-[25px] bg-white p-5">
//         <View className="flex-row items-center">
//           <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
//             <Ionicons
//               name="close"
//               size={20}
//               color="#DC2626"
//             />
//           </View>

//           <View className="ml-3">
//             <Text className="font-bold text-red-600">
//               Rejected
//             </Text>

//             <Text className="mt-1 text-xs text-[#697873]">
//               The service provider rejected
//               this booking.
//             </Text>
//           </View>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View className="mt-5 rounded-[25px] bg-white p-5">
//       <Text className="font-bold text-[#1E2926]">
//         Job Progress
//       </Text>

//       <View className="mt-6 flex-row items-center">
//         {steps.map(
//           (step, index) => {
//             const activeIndex =
//               status === "PENDING"
//                 ? -1
//                 : status === "ACCEPTED"
//                 ? 0
//                 : status === "WORKING"
//                 ? 1
//                 : status === "COMPLETED"
//                 ? 2
//                 : -1;

//             const completed =
//               index <= activeIndex;

//             return (
//               <React.Fragment
//                 key={step}
//               >
//                 <View className="items-center">
//                   <View
//                     className={`h-5 w-5 items-center justify-center rounded-full border ${
//                       completed
//                         ? "border-[#008568] bg-[#008568]"
//                         : "border-[#9AA6A2] bg-white"
//                     }`}
//                   >
//                     {completed && (
//                       <Ionicons
//                         name="checkmark"
//                         size={12}
//                         color="white"
//                       />
//                     )}
//                   </View>

//                   <Text className="mt-2 text-[9px] font-bold text-[#1E2926]">
//                     {step}
//                   </Text>
//                 </View>

//                 {index <
//                   steps.length - 1 && (
//                   <View
//                     className={`mx-2 h-[1px] flex-1 ${
//                       index <
//                       activeIndex
//                         ? "bg-[#008568]"
//                         : "bg-[#CBD6D2]"
//                     }`}
//                   />
//                 )}
//               </React.Fragment>
//             );
//           }
//         )}
//       </View>

//       {status === "PENDING" && (
//         <Text className="mt-5 text-center text-sm font-bold text-[#008568]">
//           Waiting for provider response
//         </Text>
//       )}
//     </View>
//   );
// }


import React, { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import ZoomableImage from "../../../../../components/common/ZoomableImage";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
    getBookingById,
    deleteBooking,
} from "../../../../../../lib/booking";

export default function BookingDetails() {
    const router = useRouter();

    const { id } = useLocalSearchParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            setLoading(true);

            const result = await getBookingById(String(id));

            console.log("BOOKING DETAILS:", result.booking);

            setBooking(result.booking);
        } catch (error) {
            console.log(
                "Booking Details Error:",
                error?.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = () => {
        if (!booking) {
            return;
        }

        if (booking.status !== "PENDING") {
            Alert.alert(
                "Cannot Delete",
                "Only pending bookings can be deleted."
            );

            return;
        }

        Alert.alert(
            "Delete Booking",
            "Are you sure you want to delete this booking?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeleting(true);

                            await deleteBooking(String(id));

                            Alert.alert(
                                "Booking Deleted",
                                "Your booking has been deleted successfully.",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => {
                                            router.replace(
                                                "/Customer/(tabs)/booking"
                                            );
                                        },
                                    },
                                ]
                            );
                        } catch (error) {
                            console.log(
                                "Delete Booking Error:",
                                error?.response?.data || error.message
                            );

                            Alert.alert(
                                "Delete Failed",
                                error?.response?.data?.message ||
                                "Unable to delete the booking."
                            );
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#E9EEEC]">
                <ActivityIndicator
                    size="large"
                    color="#008568"
                />

                <Text className="mt-3 text-sm text-[#697873]">
                    Loading booking...
                </Text>
            </View>
        );
    }

    if (!booking) {
        return (
            <View className="flex-1 items-center justify-center bg-[#E9EEEC] px-5">
                <Ionicons
                    name="calendar-outline"
                    size={50}
                    color="#8A9995"
                />

                <Text className="mt-4 font-bold text-[#1E2926]">
                    Booking not found
                </Text>

                <Pressable
                    onPress={() =>
                        router.replace(
                            "/Customer/(tabs)/booking"
                        )
                    }
                    className="mt-5 rounded-2xl bg-[#008568] px-6 py-3"
                >
                    <Text className="font-bold text-white">
                        Back to Bookings
                    </Text>
                </Pressable>
            </View>
        );
    }

    const provider =
        booking.serviceProvider?.serviceProviderProfile;

    const customer =
        booking.customer?.customerProfile;

    const providerName =
        `${provider?.firstName || ""} ${provider?.lastName || ""
            }`.trim();

    const customerName =
        `${customer?.firstName || ""} ${customer?.lastName || ""
            }`.trim();

    /*
     * CUSTOMER REQUEST IMAGES
     */
    const customerImages =
        booking.images?.filter(
            (image) =>
                image.imageType === "CUSTOMER_REQUEST"
        ) || [];

    /*
     * COMPLETION IMAGES
     */
    const completionImages =
        booking.images?.filter(
            (image) =>
                image.imageType === "COMPLETION"
        ) || [];

    return (
        <View className="flex-1 bg-[#E9EEEC]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
            >
                <View className="px-5 pt-12">

                    {/* HEADER */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Pressable
                                onPress={() => router.back()}
                                className="h-11 w-11 items-center justify-center rounded-full bg-white"
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={22}
                                    color="#1E2926"
                                />
                            </Pressable>

                            <View className="ml-4">
                                <Text className="text-xl font-bold text-[#1E2926]">
                                    Booking Details
                                </Text>

                                <Text className="mt-1 text-[10px] text-[#697873]">
                                    Booking ID:{" "}
                                    {booking.id
                                        ? booking.id.slice(0, 8)
                                        : "-"}
                                </Text>
                            </View>
                        </View>

                        <StatusBadge
                            status={booking.status}
                        />
                    </View>

                    {/* STATUS PROGRESS */}
                    <StatusProgress
                        status={booking.status}
                    />

                    {/* SERVICE PROVIDER */}
                    <View className="mt-5 rounded-[25px] bg-white p-5">
                        <View className="flex-row items-center">
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E5F3EF]">
                                <Ionicons
                                    name="person-outline"
                                    size={24}
                                    color="#008568"
                                />
                            </View>

                            <View className="ml-3 flex-1">
                                <Text className="text-xs text-[#697873]">
                                    SERVICE PROVIDER
                                </Text>

                                <Text className="mt-1 text-lg font-bold text-[#1E2926]">
                                    {providerName ||
                                        "Service Provider"}
                                </Text>

                                <Text className="mt-1 text-sm text-[#697873]">
                                    {provider?.serviceCategory ||
                                        "Service"}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => router.push({
                                pathname: "/Customer/(tabs)/booking/messages/[bookingId]",
                                params: { bookingId: booking.id, name: providerName || "Service Provider" },
                            })}
                            className="mt-4 items-center rounded-full bg-[#008568] py-3"
                        >
                            <Text className="text-xs font-bold text-white">MESSAGE PROVIDER</Text>
                        </Pressable>

                        {provider?.serviceLocation && (
                            <View className="mt-4 flex-row">
                                <Ionicons
                                    name="location-outline"
                                    size={18}
                                    color="#697873"
                                />

                                <Text className="ml-2 flex-1 text-xs text-[#697873]">
                                    {provider.serviceLocation}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* CUSTOMER */}
                    <View className="mt-5 rounded-[25px] bg-white p-5">
                        <Text className="text-lg font-bold text-[#1E2926]">
                            Customer
                        </Text>

                        <Text className="mt-3 font-bold text-[#1E2926]">
                            {customerName || "Customer"}
                        </Text>

                        <View className="mt-2 flex-row items-center">
                            <Ionicons
                                name="call-outline"
                                size={16}
                                color="#697873"
                            />

                            <Text className="ml-2 text-sm text-[#697873]">
                                {booking.phoneNumber || "-"}
                            </Text>
                        </View>
                    </View>

                    {/* JOB DETAILS */}
                    <View className="mt-5 rounded-[25px] bg-white p-5">
                        <Text className="text-lg font-bold text-[#1E2926]">
                            Job Details
                        </Text>

                        <DetailRow
                            label="Service"
                            value={
                                provider?.serviceCategory ||
                                "Service"
                            }
                        />

                        <DetailRow
                            label="Problem"
                            value={booking.problem || "-"}
                        />

                        <DetailRow
                            label={booking.scheduledDate ? "Service date" : "Created date"}
                            value={
                                booking.scheduledDate || (booking.createdAt
                                    ? new Date(
                                        booking.createdAt
                                    ).toLocaleDateString()
                                    : "-")
                            }
                        />

                        {booking.scheduledTime && (
                            <DetailRow
                                label="Service time"
                                value={String(booking.scheduledTime).slice(0, 5)}
                            />
                        )}

                        <DetailRow
                            label="Address"
                            value={
                                booking.serviceLocation || "-"
                            }
                        />

                        <DetailRow
                            label="Note"
                            value={booking.note || "-"}
                        />
                    </View>

                    {/* CUSTOMER REQUEST PHOTOS */}
                    <View className="mt-5 rounded-[25px] bg-white p-5">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E5F3EF]">
                                <Ionicons
                                    name="images-outline"
                                    size={21}
                                    color="#008568"
                                />
                            </View>

                            <View className="ml-3">
                                <Text className="text-lg font-bold text-[#1E2926]">
                                    Problem Photos
                                </Text>

                                <Text className="mt-1 text-xs text-[#697873]">
                                    Photos uploaded with your booking
                                </Text>
                            </View>
                        </View>

                        {customerImages.length === 0 ? (
                            <View className="mt-5 items-center rounded-2xl bg-[#F5F7F6] py-8">
                                <Ionicons
                                    name="image-outline"
                                    size={35}
                                    color="#9AA6A2"
                                />

                                <Text className="mt-2 text-sm text-[#697873]">
                                    No customer photos
                                </Text>
                            </View>
                        ) : (
                            <View className="mt-5 flex-row flex-wrap gap-3">
                                {customerImages.map((image) => (
                                    <ZoomableImage key={image.id} uri={image.imageUrl} imageClassName="h-28 w-28 rounded-2xl" />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* COMPLETION PHOTOS */}
                    {booking.status === "COMPLETED" && (
                        <View className="mt-5 rounded-[25px] bg-white p-5">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E5F3EF]">
                                    <Ionicons
                                        name="checkmark-done-outline"
                                        size={21}
                                        color="#008568"
                                    />
                                </View>

                                <View className="ml-3">
                                    <Text className="text-lg font-bold text-[#1E2926]">
                                        Completion Photos
                                    </Text>

                                    <Text className="mt-1 text-xs text-[#697873]">
                                        Photos uploaded after completing the job
                                    </Text>
                                </View>
                            </View>

                            {completionImages.length === 0 ? (
                                <View className="mt-5 items-center rounded-2xl bg-[#F5F7F6] py-8">
                                    <Ionicons
                                        name="image-outline"
                                        size={35}
                                        color="#9AA6A2"
                                    />

                                    <Text className="mt-2 text-sm text-[#697873]">
                                        No completion photos
                                    </Text>
                                </View>
                            ) : (
                                <View className="mt-5 flex-row flex-wrap gap-3">
                                    {completionImages.map(
                                        (image) => (
                                            <ZoomableImage key={image.id} uri={image.imageUrl} imageClassName="h-28 w-28 rounded-2xl" />
                                        )
                                    )}
                                </View>
                            )}

                            {/* PROVIDER NOTE */}
                            {booking.providerNote && (
                                <View className="mt-5 rounded-2xl bg-[#F5F7F6] p-4">
                                    <Text className="text-xs font-bold text-[#697873]">
                                        PROVIDER NOTE
                                    </Text>

                                    <Text className="mt-2 text-sm leading-5 text-[#1E2926]">
                                        {booking.providerNote}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* REJECTED */}
                    {booking.status === "REJECTED" && (
                        <View className="mt-5 rounded-[25px] bg-white p-5">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <Ionicons
                                        name="close"
                                        size={22}
                                        color="#DC2626"
                                    />
                                </View>

                                <Text className="ml-3 text-lg font-bold text-red-600">
                                    Booking Rejected
                                </Text>
                            </View>

                            {booking.providerNote && (
                                <View className="mt-4 rounded-2xl bg-red-50 p-4">
                                    <Text className="text-sm text-[#697873]">
                                        {booking.providerNote}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* CURRENT STATUS */}
                    {booking.status !== "REJECTED" && (
                        <Text className="mt-8 text-center text-xl font-bold text-[#008568]">
                            {booking.status}
                        </Text>
                    )}

                    {/* DELETE BOOKING */}
                    {booking.status === "PENDING" && (
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname:
                                        "/Customer/(tabs)/booking/edit-booking/[id]",
                                    params: { id: String(booking.id) },
                                })
                            }
                            className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#008568] py-4"
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color="white"
                            />
                            <Text className="ml-2 font-bold text-white">
                                Edit Booking
                            </Text>
                        </Pressable>
                    )}

                    {booking.status === "PENDING" && (
                        <Pressable
                            onPress={handleDeleteBooking}
                            disabled={deleting}
                            className={`mt-3 flex-row items-center justify-center rounded-2xl py-4 ${deleting
                                    ? "bg-red-300"
                                    : "bg-red-500"
                                }`}
                        >
                            {deleting ? (
                                <ActivityIndicator
                                    size="small"
                                    color="white"
                                />
                            ) : (
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="white"
                                />
                            )}

                            <Text className="ml-2 font-bold text-white">
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Booking"}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

/* -------------------------------- */
/* DETAIL ROW */
/* -------------------------------- */

function DetailRow({ label, value }) {
    return (
        <View className="mt-4 flex-row justify-between gap-4">
            <Text className="w-20 text-xs font-bold text-[#1E2926]">
                {label}
            </Text>

            <Text className="flex-1 text-right text-xs text-[#697873]">
                {value}
            </Text>
        </View>
    );
}

/* -------------------------------- */
/* STATUS BADGE */
/* -------------------------------- */

function StatusBadge({ status }) {
    let backgroundColor = "#E5F3EF";
    let textColor = "#008568";

    if (status === "PENDING") {
        backgroundColor = "#FFF7E6";
        textColor = "#D97706";
    }

    if (status === "ACCEPTED") {
        backgroundColor = "#E5F3EF";
        textColor = "#008568";
    }

    if (status === "WORKING") {
        backgroundColor = "#E8F1FF";
        textColor = "#2563EB";
    }

    if (status === "COMPLETED") {
        backgroundColor = "#E5F3EF";
        textColor = "#008568";
    }

    if (status === "REJECTED") {
        backgroundColor = "#FEECEC";
        textColor = "#DC2626";
    }

    return (
        <View
            style={{
                backgroundColor,
            }}
            className="rounded-full px-3 py-2"
        >
            <Text
                style={{
                    color: textColor,
                }}
                className="text-[9px] font-bold"
            >
                {status}
            </Text>
        </View>
    );
}

/* -------------------------------- */
/* STATUS PROGRESS */
/* -------------------------------- */

function StatusProgress({ status }) {
    const steps = [
        "ACCEPTED",
        "WORKING",
        "COMPLETED",
    ];

    const rejected =
        status === "REJECTED";

    if (rejected) {
        return (
            <View className="mt-5 rounded-[25px] bg-white p-5">
                <View className="flex-row items-center">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <Ionicons
                            name="close"
                            size={20}
                            color="#DC2626"
                        />
                    </View>

                    <View className="ml-3">
                        <Text className="font-bold text-red-600">
                            Rejected
                        </Text>

                        <Text className="mt-1 text-xs text-[#697873]">
                            The service provider rejected
                            this booking.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    const activeIndex =
        status === "PENDING"
            ? -1
            : status === "ACCEPTED"
                ? 0
                : status === "WORKING"
                    ? 1
                    : status === "COMPLETED"
                        ? 2
                        : -1;

    return (
        <View className="mt-5 rounded-[25px] bg-white p-5">
            <Text className="font-bold text-[#1E2926]">
                Job Progress
            </Text>

            <View className="mt-6 flex-row items-center">
                {steps.map((step, index) => {
                    const completed =
                        index <= activeIndex;

                    return (
                        <React.Fragment key={step}>
                            <View className="items-center">
                                <View
                                    className={`h-5 w-5 items-center justify-center rounded-full border ${completed
                                            ? "border-[#008568] bg-[#008568]"
                                            : "border-[#9AA6A2] bg-white"
                                        }`}
                                >
                                    {completed && (
                                        <Ionicons
                                            name="checkmark"
                                            size={12}
                                            color="white"
                                        />
                                    )}
                                </View>

                                <Text className="mt-2 text-[9px] font-bold text-[#1E2926]">
                                    {step}
                                </Text>
                            </View>

                            {index <
                                steps.length - 1 && (
                                    <View
                                        className={`mx-2 h-[1px] flex-1 ${index < activeIndex
                                                ? "bg-[#008568]"
                                                : "bg-[#CBD6D2]"
                                            }`}
                                    />
                                )}
                        </React.Fragment>
                    );
                })}
            </View>

            {status === "PENDING" && (
                <Text className="mt-5 text-center text-sm font-bold text-[#008568]">
                    Waiting for provider response
                </Text>
            )}
        </View>
    );
}
