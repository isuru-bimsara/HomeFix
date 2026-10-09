"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/types";

const EMPTY: AdminOverview = { users: [], bookings: [], reviews: [], claims: [] };
export function useAdminData() {
  const [data,setData]=useState<AdminOverview>(EMPTY); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const reload=useCallback(async()=>{try{setError("");const result=await api.get("/admin/overview");setData(result.data.data);}catch(e:any){setError(e?.response?.data?.message||"Unable to load admin data.");}finally{setLoading(false);}},[]);
  useEffect(()=>{reload();},[reload]);
  return {data,loading,error,reload};
}
