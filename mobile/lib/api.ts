

import axios from "axios";

import { getAccessToken } from "./storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not defined."
  );
}

console.log(
  "HomeFix API URL:",
  API_URL
);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token =
        await getAccessToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      console.log(
        "API REQUEST:",
        config.method?.toUpperCase(),
        `${config.baseURL}${config.url}`
      );

      return config;
    } catch (error) {
      console.log(
        "Token error:",
        error
      );

      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(
      "API RESPONSE:",
      response.status,
      response.config.url
    );

    return response;
  },
  (error) => {
    console.log(
      "API ERROR:",
      error?.response?.status
    );

    console.log(
      "API ERROR DATA:",
      error?.response?.data
    );

    console.log(
      "API ERROR MESSAGE:",
      error?.message
    );

    return Promise.reject(error);
  }
);

export default api;