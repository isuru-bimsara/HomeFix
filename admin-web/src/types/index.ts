export type Role = "CUSTOMER" | "SERVICE_PROVIDER" | "ADMIN" | "CUSTOMER_SERVICE" | "INSURANCE_PARTNER";
export type User = { id:string; email:string; role:Role; accountStatus:string; isVerified:boolean; isActive:boolean; profileImageUrl?:string|null; createdAt:string; customerProfile?:any; serviceProviderProfile?:any; insurancePartnerProfile?:any };
export type Booking = { id:string; customerId:string; serviceProviderId:string; problem:string; serviceLocation:string; status:string; scheduledDate?:string; scheduledTime?:string; createdAt:string };
export type Review = { id:string; customerId:string; serviceProviderId:string; bookingId?:string; rating:number; comment?:string; likedTags?:string[]; createdAt:string };
export type Claim = { id:string; serviceProviderId:string; damageType:string; damageAmount:string|number; incidentDate:string; incidentLocation:string; status:string; createdAt:string };
export type AdminOverview = { users:User[]; bookings:Booking[]; reviews:Review[]; claims:Claim[] };
