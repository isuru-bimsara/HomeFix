// // // import api from "./api";

// // // export interface BookingImage {
// // //   id: string;
// // //   bookingId: string;
// // //   imageType: "CUSTOMER_REQUEST" | "COMPLETION";
// // //   imageUrl: string;
// // //   publicId: string;
// // //   createdAt?: string;
// // //   updatedAt?: string;
// // // }

// // // export interface CustomerProfile {
// // //   userId: string;
// // //   firstName: string;
// // //   lastName: string;
// // //   phoneNumber?: string | null;
// // //   town?: string | null;
// // //   homeAddress?: string | null;
// // // }

// // // export interface ServiceProviderProfile {
// // //   userId: string;
// // //   firstName: string;
// // //   lastName: string;
// // //   phoneNumber?: string | null;
// // //   serviceLocation?: string | null;
// // //   serviceCategory?: string | null;
// // //   experienceYears?: number | null;
// // //   description?: string | null;

// // //   // Display only
// // //   hourlyRate?: number | null;

// // //   verificationStatus: string;
// // // }

// // // export interface BookingUser {
// // //   id: string;
// // //   email: string;
// // //   role: string;
// // //   accountStatus: string;
// // //   isActive: boolean;
// // //   profileImageUrl?: string | null;
// // //   customerProfile?: CustomerProfile;
// // //   serviceProviderProfile?: ServiceProviderProfile;
// // // }

// // // export interface Booking {
// // //   id: string;
// // //   customerId: string;
// // //   serviceProviderId: string;

// // //   problem: string;
// // //   note?: string | null;

// // //   phoneNumber: string;
// // //   serviceLocation: string;

// // //   status:
// // //     | "PENDING"
// // //     | "ACCEPTED"
// // //     | "WORKING"
// // //     | "REJECTED"
// // //     | "COMPLETED";

// // //   providerNote?: string | null;
// // //   completedAt?: string | null;

// // //   customer?: BookingUser;
// // //   serviceProvider?: BookingUser;

// // //   images?: BookingImage[];

// // //   createdAt?: string;
// // //   updatedAt?: string;
// // // }

// // // export interface CreateBookingData {
// // //   serviceProviderId: string;
// // //   problem: string;
// // //   note?: string;
// // //   phoneNumber: string;
// // //   serviceLocation: string;
// // // }

// // // export async function createBooking(
// // //   data: CreateBookingData,
// // //   images: any[] = []
// // // ) {
// // //   const formData = new FormData();

// // //   formData.append("serviceProviderId", data.serviceProviderId);
// // //   formData.append("problem", data.problem);
// // //   formData.append("note", data.note || "");
// // //   formData.append("phoneNumber", data.phoneNumber);
// // //   formData.append("serviceLocation", data.serviceLocation);

// // //   images.forEach((image, index) => {
// // //     formData.append(
// // //       "images",
// // //       {
// // //         uri: image.uri,
// // //         name: image.name || `booking-image-${index}.jpg`,
// // //         type: image.type || "image/jpeg",
// // //       } as any
// // //     );
// // //   });

// // //   const response = await api.post<{
// // //     success: boolean;
// // //     message: string;
// // //     booking: Booking;
// // //   }>("/booking", formData);

// // //   return response.data;
// // // }

// // // export async function getMyBookings() {
// // //   const response = await api.get<{
// // //     success: boolean;
// // //     bookings: Booking[];
// // //   }>("/booking/my");

// // //   return response.data;
// // // }

// // // export async function getBookingById(bookingId: string) {
// // //   const response = await api.get<{
// // //     success: boolean;
// // //     booking: Booking;
// // //   }>(`/booking/${bookingId}`);

// // //   return response.data;
// // // }

// // // export async function updateBookingDetails(
// // //   bookingId: string,
// // //   data: Partial<CreateBookingData>
// // // ) {
// // //   const response = await api.put<{
// // //     success: boolean;
// // //     message: string;
// // //     booking: Booking;
// // //   }>(`/booking/${bookingId}/details`, data);

// // //   return response.data;
// // // }


// // import api from "./api";

// // export interface BookingImage {
// //   id: string;
// //   bookingId: string;
// //   imageType:
// //     | "CUSTOMER_REQUEST"
// //     | "COMPLETION";
// //   imageUrl: string;
// //   publicId: string;
// //   createdAt?: string;
// //   updatedAt?: string;
// // }

// // export interface CustomerProfile {
// //   userId: string;
// //   firstName: string;
// //   lastName: string;
// //   phoneNumber?: string | null;
// //   town?: string | null;
// //   homeAddress?: string | null;
// // }

// // export interface ServiceProviderProfile {
// //   userId: string;
// //   firstName: string;
// //   lastName: string;
// //   phoneNumber?: string | null;
// //   serviceLocation?: string | null;
// //   serviceCategory?: string | null;
// //   experienceYears?: number | null;
// //   description?: string | null;
// //   hourlyRate?: number | null;
// //   verificationStatus: string;
// // }

// // export interface BookingUser {
// //   id: string;
// //   email: string;
// //   role: string;
// //   accountStatus: string;
// //   isActive: boolean;
// //   profileImageUrl?: string | null;

// //   customerProfile?: CustomerProfile;

// //   serviceProviderProfile?: ServiceProviderProfile;
// // }

// // export interface Booking {
// //   id: string;

// //   customerId: string;
// //   serviceProviderId: string;

// //   problem: string;

// //   note?: string | null;

// //   phoneNumber: string;

// //   serviceLocation: string;

// //   status:
// //     | "PENDING"
// //     | "ACCEPTED"
// //     | "WORKING"
// //     | "REJECTED"
// //     | "COMPLETED";

// //   providerNote?: string | null;

// //   completedAt?: string | null;

// //   customer?: BookingUser;

// //   serviceProvider?: BookingUser;

// //   images?: BookingImage[];

// //   createdAt?: string;

// //   updatedAt?: string;
// // }

// // export interface CreateBookingData {
// //   serviceProviderId: string;

// //   problem: string;

// //   note?: string;

// //   phoneNumber: string;

// //   serviceLocation: string;
// // }

// // // Create booking
// // export async function createBooking(
// //   data: CreateBookingData,
// //   images: any[] = []
// // ) {
// //   const formData = new FormData();

// //   formData.append(
// //     "serviceProviderId",
// //     data.serviceProviderId
// //   );

// //   formData.append(
// //     "problem",
// //     data.problem
// //   );

// //   formData.append(
// //     "note",
// //     data.note || ""
// //   );

// //   formData.append(
// //     "phoneNumber",
// //     data.phoneNumber
// //   );

// //   formData.append(
// //     "serviceLocation",
// //     data.serviceLocation
// //   );

// //   images.forEach((image, index) => {
// //     formData.append(
// //       "images",
// //       {
// //         uri: image.uri,
// //         name:
// //           image.name ||
// //           `booking-image-${index}.jpg`,
// //         type:
// //           image.type ||
// //           "image/jpeg",
// //       } as any
// //     );
// //   });

// //   const response = await api.post<{
// //     success: boolean;
// //     message: string;
// //     booking: Booking;
// //   }>(
// //     "/booking",
// //     formData
// //   );

// //   return response.data;
// // }

// // // Get customer's bookings
// // export async function getMyBookings() {
// //   const response = await api.get<{
// //     success: boolean;
// //     bookings: Booking[];
// //   }>("/booking/my");

// //   return response.data;
// // }

// // // Get one booking
// // export async function getBookingById(
// //   bookingId: string
// // ) {
// //   const response = await api.get<{
// //     success: boolean;
// //     booking: Booking;
// //   }>(
// //     `/booking/${bookingId}`
// //   );

// //   return response.data;
// // }

// // // Update booking details
// // export async function updateBookingDetails(
// //   bookingId: string,
// //   data: Partial<CreateBookingData>
// // ) {
// //   const response = await api.put<{
// //     success: boolean;
// //     message: string;
// //     booking: Booking;
// //   }>(
// //     `/booking/${bookingId}/details`,
// //     data
// //   );

// //   return response.data;
// // }

// // // Add booking images
// // export async function addBookingImages(
// //   bookingId: string,
// //   images: any[]
// // ) {
// //   const formData = new FormData();

// //   images.forEach((image, index) => {
// //     formData.append(
// //       "images",
// //       {
// //         uri: image.uri,
// //         name:
// //           image.name ||
// //           `booking-image-${index}.jpg`,
// //         type:
// //           image.type ||
// //           "image/jpeg",
// //       } as any
// //     );
// //   });

// //   const response = await api.post<{
// //     success: boolean;
// //     message: string;
// //     booking: Booking;
// //   }>(
// //     `/booking/${bookingId}/images`,
// //     formData
// //   );

// //   return response.data;
// // }

// // // Delete booking image
// // export async function deleteBookingImage(
// //   bookingId: string,
// //   imageId: string
// // ) {
// //   const response = await api.delete<{
// //     success: boolean;
// //     message: string;
// //   }>(
// //     `/booking/${bookingId}/images/${imageId}`
// //   );

// //   return response.data;
// // }


// import api from "./api";

// export interface BookingImage {
//   id: string;
//   bookingId: string;
//   imageType:
//     | "CUSTOMER_REQUEST"
//     | "COMPLETION";
//   imageUrl: string;
//   publicId: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CustomerProfile {
//   userId: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber?: string | null;
//   town?: string | null;
//   homeAddress?: string | null;
// }

// export interface ServiceProviderProfile {
//   userId: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber?: string | null;
//   serviceLocation?: string | null;
//   serviceCategory?: string | null;
//   experienceYears?: number | null;
//   description?: string | null;
//   hourlyRate?: number | null;
//   verificationStatus: string;
// }

// export interface BookingUser {
//   id: string;
//   email: string;
//   role: string;
//   accountStatus: string;
//   isActive: boolean;
//   profileImageUrl?: string | null;

//   customerProfile?: CustomerProfile;

//   serviceProviderProfile?: ServiceProviderProfile;
// }

// export interface Booking {
//   id: string;

//   customerId: string;
//   serviceProviderId: string;

//   problem: string;

//   note?: string | null;

//   phoneNumber: string;

//   serviceLocation: string;

//   status:
//     | "PENDING"
//     | "ACCEPTED"
//     | "WORKING"
//     | "REJECTED"
//     | "COMPLETED";

//   providerNote?: string | null;

//   completedAt?: string | null;

//   customer?: BookingUser;

//   serviceProvider?: BookingUser;

//   images?: BookingImage[];

//   createdAt?: string;

//   updatedAt?: string;
// }

// export interface CreateBookingData {
//   serviceProviderId: string;
//   problem: string;
//   note?: string;
//   phoneNumber: string;
//   serviceLocation: string;
// }


// // =====================================================
// // CREATE BOOKING
// // =====================================================

// export async function createBooking(
//   data: CreateBookingData,
//   images: any[] = []
// ) {
//   const formData = new FormData();

//   formData.append(
//     "serviceProviderId",
//     data.serviceProviderId
//   );

//   formData.append(
//     "problem",
//     data.problem
//   );

//   formData.append(
//     "note",
//     data.note || ""
//   );

//   formData.append(
//     "phoneNumber",
//     data.phoneNumber
//   );

//   formData.append(
//     "serviceLocation",
//     data.serviceLocation
//   );

//   images.forEach((image, index) => {
//     formData.append(
//       "images",
//       {
//         uri: image.uri,
//         name:
//           image.name ||
//           `booking-image-${index}.jpg`,
//         type:
//           image.type ||
//           "image/jpeg",
//       } as any
//     );
//   });

//   const response = await api.post<{
//     success: boolean;
//     message: string;
//     booking: Booking;
//   }>(
//     "/booking",
//     formData
//   );

//   return response.data;
// }


// // =====================================================
// // CUSTOMER BOOKINGS
// // =====================================================

// export async function getCustomerBookings() {
//   const response = await api.get<{
//     success: boolean;
//     bookings: Booking[];
//   }>("/booking/customer/my");

//   return response.data;
// }


// // =====================================================
// // SERVICE PROVIDER BOOKINGS
// // =====================================================

// export async function getProviderBookings() {
//   const response = await api.get<{
//     success: boolean;
//     bookings: Booking[];
//   }>("/booking/provider/my");

//   return response.data;
// }


// // =====================================================
// // GET ONE BOOKING
// // =====================================================

// export async function getBookingById(
//   bookingId: string
// ) {
//   const response = await api.get<{
//     success: boolean;
//     booking: Booking;
//   }>(
//     `/booking/${bookingId}`
//   );

//   return response.data;
// }


// // =====================================================
// // UPDATE BOOKING DETAILS
// // =====================================================

// export async function updateBookingDetails(
//   bookingId: string,
//   data: Partial<CreateBookingData>
// ) {
//   const response = await api.put<{
//     success: boolean;
//     message: string;
//     booking: Booking;
//   }>(
//     `/booking/${bookingId}/details`,
//     data
//   );

//   return response.data;
// }


// // =====================================================
// // ADD BOOKING IMAGES
// // =====================================================

// export async function addBookingImages(
//   bookingId: string,
//   images: any[]
// ) {
//   const formData = new FormData();

//   images.forEach((image, index) => {
//     formData.append(
//       "images",
//       {
//         uri: image.uri,
//         name:
//           image.name ||
//           `booking-image-${index}.jpg`,
//         type:
//           image.type ||
//           "image/jpeg",
//       } as any
//     );
//   });

//   const response = await api.post<{
//     success: boolean;
//     message: string;
//     booking: Booking;
//   }>(
//     `/booking/${bookingId}/images`,
//     formData
//   );

//   return response.data;
// }


// // =====================================================
// // DELETE BOOKING IMAGE
// // =====================================================

// export async function deleteBookingImage(
//   bookingId: string,
//   imageId: string
// ) {
//   const response = await api.delete<{
//     success: boolean;
//     message: string;
//   }>(
//     `/booking/${bookingId}/images/${imageId}`
//   );

//   return response.data;
// }


import api from "./api";

export interface BookingImage {
  id: string;
  bookingId: string;
  imageType:
    | "CUSTOMER_REQUEST"
    | "COMPLETION";
  imageUrl: string;
  publicId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  town?: string | null;
  homeAddress?: string | null;
}

export interface ServiceProviderProfile {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  serviceLocation?: string | null;
  serviceCategory?: string | null;
  experienceYears?: number | null;
  description?: string | null;
  hourlyRate?: number | null;
  verificationStatus: string;
}

export interface BookingUser {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  isActive: boolean;
  profileImageUrl?: string | null;

  customerProfile?: CustomerProfile;

  serviceProviderProfile?: ServiceProviderProfile;
}

export interface Booking {
  id: string;

  customerId: string;
  serviceProviderId: string;

  problem: string;

  note?: string | null;

  phoneNumber: string;

  serviceLocation: string;

  status:
    | "PENDING"
    | "ACCEPTED"
    | "WORKING"
    | "REJECTED"
    | "COMPLETED";

  providerNote?: string | null;

  completedAt?: string | null;

  scheduledDate?: string | null;

  scheduledTime?: string | null;

  customer?: BookingUser;

  serviceProvider?: BookingUser;

  images?: BookingImage[];

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateBookingData {
  serviceProviderId: string;
  problem: string;
  note?: string;
  phoneNumber: string;
  serviceLocation: string;
}


// =====================================================
// CREATE BOOKING
// =====================================================

export async function createBooking(
  data: CreateBookingData,
  images: any[] = []
) {
  const formData = new FormData();

  formData.append(
    "serviceProviderId",
    data.serviceProviderId
  );

  formData.append(
    "problem",
    data.problem
  );

  formData.append(
    "note",
    data.note || ""
  );

  formData.append(
    "phoneNumber",
    data.phoneNumber
  );

  formData.append(
    "serviceLocation",
    data.serviceLocation
  );

  images.forEach((image, index) => {
    formData.append(
      "images",
      {
        uri: image.uri,
        name:
          image.name ||
          `booking-image-${index}.jpg`,
        type:
          image.type ||
          "image/jpeg",
      } as any
    );
  });

  const response = await api.post<{
    success: boolean;
    message: string;
    booking: Booking;
  }>(
    "/booking",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    }
  );

  return response.data;
}


// =====================================================
// CUSTOMER BOOKINGS
// =====================================================

export async function getCustomerBookings() {
  const response = await api.get<{
    success: boolean;
    bookings: Booking[];
  }>("/booking/customer/my");

  return response.data;
}


// =====================================================
// SERVICE PROVIDER BOOKINGS
// =====================================================

export async function getProviderBookings() {
  const response = await api.get<{
    success: boolean;
    bookings: Booking[];
  }>("/booking/provider/my");

  return response.data;
}


// =====================================================
// GET ONE BOOKING
// =====================================================

export async function getBookingById(
  bookingId: string
) {
  const response = await api.get<{
    success: boolean;
    booking: Booking;
  }>(
    `/booking/${bookingId}`
  );

  return response.data;
}


// =====================================================
// UPDATE BOOKING DETAILS
// =====================================================

export async function updateBookingDetails(
  bookingId: string,
  data: Partial<CreateBookingData>
) {
  const response = await api.put<{
    success: boolean;
    message: string;
    booking: Booking;
  }>(
    `/booking/${bookingId}/details`,
    data
  );

  return response.data;
}


// =====================================================
// ADD BOOKING IMAGES
// =====================================================

export async function addBookingImages(
  bookingId: string,
  images: any[]
) {
  const formData = new FormData();

  images.forEach((image, index) => {
    formData.append(
      "images",
      {
        uri: image.uri,
        name:
          image.name ||
          `booking-image-${index}.jpg`,
        type:
          image.type ||
          "image/jpeg",
      } as any
    );
  });

  const response = await api.post<{
    success: boolean;
    message: string;
    booking: Booking;
  }>(
    `/booking/${bookingId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    }
  );

  return response.data;
}


// =====================================================
// DELETE BOOKING IMAGE
// =====================================================

export async function deleteBookingImage(
  bookingId: string,
  imageId: string
) {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(
    `/booking/${bookingId}/images/${imageId}`
  );

  return response.data;
}


// =====================================================
// DELETE BOOKING
// =====================================================

export async function deleteBooking(
  bookingId: string
) {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(
    `/booking/${bookingId}`
  );

  return response.data;
}

export async function acceptProviderBooking(bookingId: string, scheduledDate: string, scheduledTime: string) {
  const response = await api.put(`/booking/${bookingId}/status`, { scheduledDate, scheduledTime });
  return response.data;
}

export async function rejectProviderBooking(bookingId: string, providerNote = "") {
  const response = await api.put(`/booking/${bookingId}/reject`, { providerNote });
  return response.data;
}

export async function startProviderBooking(bookingId: string) {
  const response = await api.put(`/booking/${bookingId}/start`);
  return response.data;
}

function appendCompletionImages(form: FormData, images: any[]) {
  images.forEach((image, index) => {
    form.append("images", {
      uri: image.uri,
      name: image.fileName || image.name || `completion-${index}.jpg`,
      type: image.mimeType || image.type || "image/jpeg",
    } as any);
  });
}

export async function completeProviderBooking(bookingId: string, providerNote: string, images: any[] = []) {
  const form = new FormData();
  form.append("providerNote", providerNote);
  appendCompletionImages(form, images);
  const response = await api.put(`/booking/${bookingId}/complete`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return response.data;
}

export async function updateProviderBookingCompletion(bookingId: string, providerNote: string, images: any[] = []) {
  const form = new FormData();
  form.append("providerNote", providerNote);
  appendCompletionImages(form, images);
  const response = await api.patch(`/booking/${bookingId}/completion`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return response.data;
}

export async function deleteProviderBookingCompletion(bookingId: string) {
  const response = await api.delete(`/booking/${bookingId}/completion`);
  return response.data;
}
