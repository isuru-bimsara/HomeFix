// // import * as SecureStore from "expo-secure-store";

// // const ACCESS_TOKEN_KEY = "homefix_access_token";
// // const REFRESH_TOKEN_KEY = "homefix_refresh_token";
// // const USER_KEY = "homefix_user";

// // export async function saveAuthData(
// //   accessToken: string,
// //   refreshToken: string,
// //   user: unknown
// // ) {
// //   await SecureStore.setItemAsync(
// //     ACCESS_TOKEN_KEY,
// //     accessToken
// //   );

// //   await SecureStore.setItemAsync(
// //     REFRESH_TOKEN_KEY,
// //     refreshToken
// //   );

// //   await SecureStore.setItemAsync(
// //     USER_KEY,
// //     JSON.stringify(user)
// //   );
// // }

// // export async function getAccessToken() {
// //   return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
// // }

// // export async function getRefreshToken() {
// //   return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
// // }

// // export async function getStoredUser() {
// //   const user = await SecureStore.getItemAsync(USER_KEY);

// //   if (!user) {
// //     return null;
// //   }

// //   return JSON.parse(user);
// // }

// // export async function clearAuthData() {
// //   await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
// //   await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
// //   await SecureStore.deleteItemAsync(USER_KEY);
// // }


// import * as SecureStore from "expo-secure-store";

// import type { User } from "../src/types/auth";

// const ACCESS_TOKEN_KEY = "homefix_access_token";
// const REFRESH_TOKEN_KEY = "homefix_refresh_token";
// const USER_KEY = "homefix_user";

// export async function saveAuthData(
//   accessToken: string,
//   refreshToken: string,
//   user: User
// ) {
//   await SecureStore.setItemAsync(
//     ACCESS_TOKEN_KEY,
//     accessToken
//   );

//   await SecureStore.setItemAsync(
//     REFRESH_TOKEN_KEY,
//     refreshToken
//   );

//   await SecureStore.setItemAsync(
//     USER_KEY,
//     JSON.stringify(user)
//   );
// }

// export async function getAccessToken() {
//   return SecureStore.getItemAsync(
//     ACCESS_TOKEN_KEY
//   );
// }

// export async function getRefreshToken() {
//   return SecureStore.getItemAsync(
//     REFRESH_TOKEN_KEY
//   );
// }

// export async function getStoredUser(): Promise<User | null> {
//   const userString =
//     await SecureStore.getItemAsync(USER_KEY);

//   if (!userString) {
//     return null;
//   }

//   try {
//     return JSON.parse(userString) as User;
//   } catch (error) {
//     console.log(
//       "Stored user parse error:",
//       error
//     );

//     return null;
//   }
// }

// export async function clearAuthData() {
//   await SecureStore.deleteItemAsync(
//     ACCESS_TOKEN_KEY
//   );

//   await SecureStore.deleteItemAsync(
//     REFRESH_TOKEN_KEY
//   );

//   await SecureStore.deleteItemAsync(
//     USER_KEY
//   );
// }


import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { User } from "../src/types/auth";

const ACCESS_TOKEN_KEY = "homefix_access_token";
const REFRESH_TOKEN_KEY = "homefix_refresh_token";
const USER_KEY = "homefix_user";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }

    return null;
  }

  return await SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthData(
  accessToken: string,
  refreshToken: string,
  user: User
) {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function getAccessToken() {
  return await getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return await getItem(REFRESH_TOKEN_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  const value = await getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.log("Invalid stored user:", error);
    return null;
  }
}

export async function clearAuthData() {
  await removeItem(ACCESS_TOKEN_KEY);
  await removeItem(REFRESH_TOKEN_KEY);
  await removeItem(USER_KEY);
}