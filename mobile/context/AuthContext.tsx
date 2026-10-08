// // // import React, {
// // //   createContext,
// // //   useContext,
// // //   useEffect,
// // //   useState,
// // // } from "react";

// // // import {
// // //   clearAuthData,
// // //   getStoredUser,
// // //   saveAuthData,
// // // } from "../../lib/storage";

// // // import type { User } from "../types/auth";

// // // interface AuthContextType {
// // //   user: User | null;
// // //   loading: boolean;

// // //   setAuth: (
// // //     accessToken: string,
// // //     refreshToken: string,
// // //     user: User
// // //   ) => Promise<void>;

// // //   logout: () => Promise<void>;
// // // }

// // // const AuthContext = createContext<AuthContextType | undefined>(
// // //   undefined
// // // );

// // // export function AuthProvider({
// // //   children,
// // // }: {
// // //   children: React.ReactNode;
// // // }) {
// // //   const [user, setUser] = useState<User | null>(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     loadStoredAuth();
// // //   }, []);

// // //   const loadStoredAuth = async () => {
// // //     try {
// // //       const storedUser = await getStoredUser();

// // //       if (storedUser) {
// // //         setUser(storedUser);
// // //       }
// // //     } catch (error) {
// // //       console.log("Load auth error:", error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const setAuth = async (
// // //     accessToken: string,
// // //     refreshToken: string,
// // //     userData: User
// // //   ) => {
// // //     await saveAuthData(
// // //       accessToken,
// // //       refreshToken,
// // //       userData
// // //     );

// // //     setUser(userData);
// // //   };

// // //   const logout = async () => {
// // //     await clearAuthData();
// // //     setUser(null);
// // //   };

// // //   return (
// // //     <AuthContext.Provider
// // //       value={{
// // //         user,
// // //         loading,
// // //         setAuth,
// // //         logout,
// // //       }}
// // //     >
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // }

// // // export function useAuth() {
// // //   const context = useContext(AuthContext);

// // //   if (!context) {
// // //     throw new Error(
// // //       "useAuth must be used inside AuthProvider"
// // //     );
// // //   }

// // //   return context;
// // // }


// // import React, {
// //   createContext,
// //   useContext,
// //   useEffect,
// //   useState,
// // } from "react";

// // import {
// //   clearAuthData,
// //   getStoredUser,
// //   saveAuthData,
// // } from "../../lib/storage";

// // import type { User } from "../types/auth";

// // interface AuthContextType {
// //   user: User | null;

// //   loading: boolean;

// //   setAuth: (
// //     accessToken: string,
// //     refreshToken: string,
// //     user: User
// //   ) => Promise<void>;

// //   logout: () => Promise<void>;
// // }

// // const AuthContext =
// //   createContext<AuthContextType | undefined>(
// //     undefined
// //   );

// // export function AuthProvider({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const [user, setUser] =
// //     useState<User | null>(null);

// //   const [loading, setLoading] =
// //     useState(true);

// //   useEffect(() => {
// //     loadStoredAuth();
// //   }, []);

// //   const loadStoredAuth = async () => {
// //     try {
// //       const storedUser =
// //         await getStoredUser();

// //       if (storedUser) {
// //         setUser(storedUser);
// //       }
// //     } catch (error) {
// //       console.log(
// //         "Load auth error:",
// //         error
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const setAuth = async (
// //     accessToken: string,
// //     refreshToken: string,
// //     userData: User
// //   ) => {
// //     await saveAuthData(
// //       accessToken,
// //       refreshToken,
// //       userData
// //     );

// //     setUser(userData);
// //   };

// //   const logout = async () => {
// //     try {
// //       await clearAuthData();
// //       setUser(null);
// //     } catch (error) {
// //       console.log(
// //         "Logout error:",
// //         error
// //       );
// //     }
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         loading,
// //         setAuth,
// //         logout,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export function useAuth() {
// //   const context =
// //     useContext(AuthContext);

// //   if (!context) {
// //     throw new Error(
// //       "useAuth must be used inside AuthProvider"
// //     );
// //   }

// //   return context;
// // }



// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import {
//   clearAuthData,
//   getStoredUser,
//   saveAuthData,
// } from "../../lib/storage";

// import type { User } from "../types/auth";

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;

//   setAuth: (
//     accessToken: string,
//     refreshToken: string,
//     user: User
//   ) => Promise<void>;

//   logout: () => Promise<void>;
// }

// const AuthContext =
//   createContext<AuthContextType | undefined>(
//     undefined
//   );

// export function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [user, setUser] =
//     useState<User | null>(null);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {
//     loadStoredAuth();
//   }, []);

//   async function loadStoredAuth() {
//     try {
//       const storedUser =
//         await getStoredUser();

//       if (storedUser) {
//         setUser(storedUser);
//       }
//     } catch (error) {
//       console.log(
//         "Load auth error:",
//         error
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function setAuth(
//     accessToken: string,
//     refreshToken: string,
//     userData: User
//   ) {
//     await saveAuthData(
//       accessToken,
//       refreshToken,
//       userData
//     );

//     setUser(userData);
//   }

//   async function logout() {
//     await clearAuthData();

//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         setAuth,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context =
//     useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth must be used inside AuthProvider"
//     );
//   }

//   return context;
// }



import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearAuthData,
  getStoredUser,
  saveAuthData,
} from "../../lib/storage";

import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedUser =
        await getStoredUser();

      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.log(
        "Load auth error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function setAuth(
    accessToken: string,
    refreshToken: string,
    userData: User
  ) {
    await saveAuthData(
      accessToken,
      refreshToken,
      userData
    );

    setUser(userData);
  }

  async function logout() {
    await clearAuthData();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}