export type UserRole =
  | "CUSTOMER"
  | "SERVICE_PROVIDER"
  | "ADMIN"
  | "CUSTOMER_SERVICE"
  | "INSURANCE_PARTNER";

export interface User {
  id: string;
  email: string;
  role: UserRole;

  accountStatus:
    | "REGISTERED"
    | "BANNED";

  isVerified: boolean;
  isActive: boolean;

  profileImageUrl?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;

  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}