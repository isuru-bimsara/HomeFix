// import React, { useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

// const handleLogin = async () => {
//   if (!email.trim()) {
//     return;
//   }

//   if (!password) {
//     return;
//   }

//   try {
//     const result = await loginUser(
//       email.trim(),
//       password
//     );

//     if (!result.success) {
//       console.log(result.message);
//       return;
//     }

//     await setAuth(
//       result.data.accessToken,
//       result.data.refreshToken,
//       result.data.user
//     );

//     // Navigate according to role
//     if (result.data.user.role === "CUSTOMER") {
//       router.replace("/Customer/(tabs)");
//       return;
//     }

//     if (
//       result.data.user.role ===
//       "SERVICE_PROVIDER"
//     ) {
//       router.replace(
//         "/ServiceProvider/(tabs)"
//       );
//       return;
//     }

//   } catch (error: any) {
//     console.log(
//       "Login error:",
//       error?.response?.data || error
//     );
//   }
// };

//   const handleGoogleLogin = () => {
//     console.log("Google login");
//   };

//   const handleForgotPassword = () => {
//     console.log("Forgot password");
//   };

//   const handleCreateAccount = () => {
//     console.log("Create account");
//   };

//   return (
//     <KeyboardAvoidingView
//       className="flex-1 bg-[#E9F0EE]"
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ flexGrow: 1 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="flex-1 px-[26px] pt-[44px] pb-[28px]">

//           {/* Top navigation */}
//           <View className="flex-row items-center justify-between">
//             <Pressable
//               className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white"
//               onPress={() => console.log("Back")}
//             >
//               <Ionicons
//                 name="arrow-back"
//                 size={21}
//                 color="#183B34"
//               />
//             </Pressable>

//             <View className="flex-row items-center">
//               {/* Logo box */}
//               <View className="h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#008568]">
//                 <Ionicons
//                   name="home-outline"
//                   size={29}
//                   color="#FFFFFF"
//                 />
//               </View>

//               <View className="ml-[11px]">
//                 <Text className="text-[20px] font-bold text-[#173A33]">
//                   HomeFix
//                 </Text>

//                 <Text className="mt-[1px] text-[7px] font-semibold tracking-[0.7px] text-[#60746E]">
//                   TRUSTED HOME SERVICES
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Main content */}
//           <View className="mt-[48px]">

//             <Text className="text-[26px] font-bold leading-[32px] text-[#173A33]">
//               Welcome back
//             </Text>

//             <Text className="mt-[5px] text-[14px] leading-[20px] text-[#788B85]">
//               Login to your HomeFix account
//             </Text>

//             {/* Email */}
//             <View className="mt-[22px]">
//               <Text className="mb-[7px] text-[10px] font-bold text-[#173A33]">
//                 Email
//               </Text>

//               <View className="h-[48px] rounded-[15px] border border-[#C9D7D3] bg-white px-[17px] justify-center">
//                 <TextInput
//                   value={email}
//                   onChangeText={setEmail}
//                   placeholder="Enter your email"
//                   placeholderTextColor="#8A9995"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   className="flex-1 text-[12px] text-[#173A33]"
//                 />
//               </View>
//             </View>

//             {/* Password */}
//             <View className="mt-[18px]">
//               <Text className="mb-[7px] text-[10px] font-bold text-[#173A33]">
//                 Password
//               </Text>

//               <View className="h-[48px] flex-row items-center rounded-[15px] border border-[#C9D7D3] bg-white px-[17px]">
//                 <TextInput
//                   value={password}
//                   onChangeText={setPassword}
//                   placeholder="Enter your password"
//                   placeholderTextColor="#8A9995"
//                   secureTextEntry={!showPassword}
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   className="flex-1 text-[12px] text-[#173A33]"
//                 />

//                 <Pressable
//                   onPress={() => setShowPassword(!showPassword)}
//                   className="ml-2"
//                   hitSlop={8}
//                 >
//                   <Ionicons
//                     name={showPassword ? "eye-outline" : "eye-off-outline"}
//                     size={19}
//                     color="#668079"
//                   />
//                 </Pressable>
//               </View>

//               {/* Forgot password */}
//               <Pressable
//                 onPress={handleForgotPassword}
//                 className="mt-[7px] self-end"
//               >
//                 <Text className="text-[10px] font-bold text-[#008568]">
//                   Forgot password?
//                 </Text>
//               </Pressable>
//             </View>

//             {/* Login button */}
//             <Pressable
//               onPress={handleLogin}
//               className="mt-[18px] h-[47px] flex-row items-center justify-center rounded-full bg-[#008568]"
//             >
//               <Text className="text-[13px] font-bold text-white">
//                 Login
//               </Text>

//               <Ionicons
//                 name="arrow-forward"
//                 size={24}
//                 color="#FFFFFF"
//                 style={{
//                   position: "absolute",
//                   right: 14,
//                 }}
//               />
//             </Pressable>

//             {/* Divider */}
//             <View className="mt-[20px] flex-row items-center">
//               <View className="h-[1px] flex-1 bg-[#CED9D6]" />

//               <Text className="mx-[18px] text-[9px] font-medium text-[#7C8B87]">
//                 OR
//               </Text>

//               <View className="h-[1px] flex-1 bg-[#CED9D6]" />
//             </View>

//             {/* Google button */}
//             <Pressable
//               onPress={handleGoogleLogin}
//               className="mt-[14px] h-[48px] flex-row items-center justify-center rounded-full border border-[#CFD9D6] bg-white"
//             >
//               <Text className="absolute left-[19px] text-[20px] font-bold text-[#4285F4]">
//                 G
//               </Text>

//               <Text className="text-[12px] font-bold text-[#173A33]">
//                 Continue with Google
//               </Text>
//             </Pressable>

//             {/* Register */}
//             <View className="mt-[27px] items-center">
//               <Text className="text-[10px] text-[#82908D]">
//                 New to HomeFix?
//               </Text>

//               <Pressable
//                 onPress={handleCreateAccount}
//                 className="mt-[5px]"
//               >
//                 <Text className="text-[11px] font-bold text-[#008568]">
//                   Create Account
//                 </Text>
//               </Pressable>
//             </View>
//           </View>

//           {/* Bottom message */}
//           <View className="mt-auto items-center pt-[50px]">
//             <Text className="text-[14px] italic text-[#008568]">
//               Trusted people for a better home
//             </Text>

//             <Text className="mt-[7px] text-[8px] text-[#8A9995]">
//               Secure login • Your account stays protected
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// export default Login;



import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { googleLoginUser, loginUser } from "../../../lib/auth";
import { setPendingGoogleIdToken } from "../../../lib/googleRegistration";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const { setAuth } = useAuth();

const handleLogin = async () => {
  if (!email.trim()) {
    Alert.alert(
      "Required",
      "Please enter your email."
    );
    return;
  }

  if (!password) {
    Alert.alert(
      "Required",
      "Please enter your password."
    );
    return;
  }

  try {
    const result = await loginUser(
      email,
      password
    );

    if (!result.success) {
      Alert.alert(
        "Login failed",
        result.message
      );
      return;
    }

    await setAuth(
      result.data.accessToken,
      result.data.refreshToken,
      result.data.user
    );

    const role =
      result.data.user.role;

    if (role === "CUSTOMER") {
      router.replace(
        "/Customer/(tabs)"
      );
      return;
    }

    if (
      role === "SERVICE_PROVIDER"
    ) {
      router.replace(
        "/ServiceProvider/(tabs)"
      );
      return;
    }

    if (role === "INSURANCE_PARTNER") {
      router.replace("/InsuarancePartner/(tabs)");
      return;
    }

    Alert.alert(
      "Access denied",
      "This mobile application does not support this account role."
    );
  } catch (error: any) {
    console.log(
      "Login error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    if (error?.response?.data?.code === "EMAIL_NOT_VERIFIED") {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          email: error.response.data.data?.email || email.trim().toLowerCase(),
          role: error.response.data.data?.role || "",
        },
      });
      return;
    }

    const message =
      error?.response?.data?.message ||
      "Unable to login. Please check your email and password.";

    Alert.alert(
      "Login failed",
      message
    );
  }
};

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const result = await googleLoginUser({ idToken });
      await setAuth(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.user
      );

      if (result.data.user.role === "CUSTOMER") {
        router.replace("/Customer/(tabs)");
      } else if (result.data.user.role === "SERVICE_PROVIDER") {
        router.replace("/ServiceProvider/(tabs)");
      } else {
        Alert.alert("Google login", "This role cannot use mobile Google login.");
      }
    } catch (error: any) {
      if (error?.response?.data?.code === "GOOGLE_REGISTRATION_REQUIRED") {
        setPendingGoogleIdToken(idToken);
        router.push("/(auth)/register-role");
        return;
      }

      Alert.alert(
        "Google login failed",
        error?.response?.data?.message || "Unable to sign in with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push({
      pathname: "/(auth)/forgot-password",
      params: email.trim() ? { email: email.trim().toLowerCase() } : {},
    });
  };

  const handleCreateAccount = () => {
    router.push("/(auth)/register-role");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#E9F0EE]"
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-[26px] pt-[44px] pb-[28px]">

          {/* Top navigation */}
          <View className="flex-row items-center justify-between">
            <Pressable
              className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white"
              onPress={handleBack}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color="#183B34"
              />
            </Pressable>

            <View className="flex-row items-center">
              <View className="h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#008568]">
                <Ionicons
                  name="home-outline"
                  size={29}
                  color="#FFFFFF"
                />
              </View>

              <View className="ml-[11px]">
                <Text className="text-[20px] font-bold text-[#173A33]">
                  HomeFix
                </Text>

                <Text className="mt-[1px] text-[7px] font-semibold tracking-[0.7px] text-[#60746E]">
                  TRUSTED HOME SERVICES
                </Text>
              </View>
            </View>
          </View>

          {/* Main content */}
          <View className="mt-[48px]">

            <Text className="text-[26px] font-bold leading-[32px] text-[#173A33]">
              Welcome back
            </Text>

            <Text className="mt-[5px] text-[14px] leading-[20px] text-[#788B85]">
              Login to your HomeFix account
            </Text>

            {/* Email */}
            <View className="mt-[22px]">
              <Text className="mb-[7px] text-[10px] font-bold text-[#173A33]">
                Email
              </Text>

              <View className="h-[48px] justify-center rounded-[15px] border border-[#C9D7D3] bg-white px-[17px]">
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setErrorMessage("");
                    setFieldErrors((current) => ({
                      ...current,
                      email: /^\S+@\S+\.\S+$/.test(value.trim()) ? "" : "Enter a valid email address.",
                    }));
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#8A9995"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  className="flex-1 text-[12px] text-[#173A33]"
                />
              </View>
              {fieldErrors.email ? <Text className="mt-1 text-[10px] text-red-600">{fieldErrors.email}</Text> : null}
            </View>

            {/* Password */}
            <View className="mt-[18px]">
              <Text className="mb-[7px] text-[10px] font-bold text-[#173A33]">
                Password
              </Text>

              <View className="h-[48px] flex-row items-center rounded-[15px] border border-[#C9D7D3] bg-white px-[17px]">
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrorMessage("");
                    setFieldErrors((current) => ({
                      ...current,
                      password: value.length >= 8 ? "" : "Password must contain at least 8 characters.",
                    }));
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#8A9995"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  className="flex-1 text-[12px] text-[#173A33]"
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  className="ml-2"
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={19}
                    color="#668079"
                  />
                </Pressable>
              </View>
              {fieldErrors.password ? <Text className="mt-1 text-[10px] text-red-600">{fieldErrors.password}</Text> : null}

              {/* Forgot password */}
              <Pressable
                onPress={handleForgotPassword}
                className="mt-[7px] self-end"
              >
                <Text className="text-[10px] font-bold text-[#008568]">
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {/* Error message */}
            {errorMessage ? (
              <View className="mt-[12px] rounded-[10px] bg-[#FDECEC] px-[12px] py-[9px]">
                <Text className="text-[10px] leading-[15px] text-[#C0392B]">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Login button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`mt-[18px] h-[47px] flex-row items-center justify-center rounded-full ${
                loading
                  ? "bg-[#72B8A8]"
                  : "bg-[#008568]"
              }`}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text className="text-[13px] font-bold text-white">
                    Login
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color="#FFFFFF"
                    style={{
                      position: "absolute",
                      right: 14,
                    }}
                  />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="mt-[20px] flex-row items-center">
              <View className="h-[1px] flex-1 bg-[#CED9D6]" />

              <Text className="mx-[18px] text-[9px] font-medium text-[#7C8B87]">
                OR
              </Text>

              <View className="h-[1px] flex-1 bg-[#CED9D6]" />
            </View>

            {/* Google button */}
            <View className="mt-[14px]">
              <GoogleAuthButton onToken={handleGoogleLogin} disabled={loading} />
            </View>

            {/* Register */}
            <View className="mt-[27px] items-center">
              <Text className="text-[10px] text-[#82908D]">
                New to HomeFix?
              </Text>

              <Pressable
                onPress={handleCreateAccount}
                className="mt-[5px]"
              >
                <Text className="text-[11px] font-bold text-[#008568]">
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom message */}
          <View className="mt-auto items-center pt-[50px]">
            <Text className="text-[14px] italic text-[#008568]">
              Trusted people for a better home
            </Text>

            <Text className="mt-[7px] text-[8px] text-[#8A9995]">
              Secure login • Your account stays protected
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Login;
