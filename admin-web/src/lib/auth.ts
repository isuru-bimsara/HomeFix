import { api } from "./api";
import { saveSession } from "./storage";

export async function adminLogin(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.data?.user?.role !== "ADMIN") throw new Error("Only administrator accounts can access this dashboard.");
  saveSession(data.data.accessToken, data.data.user);
  return data.data.user;
}
