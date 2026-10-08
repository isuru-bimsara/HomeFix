import api from "./api";
export const getNotifications=async()=>(await api.get("/notifications")).data;
export const markNotificationRead=async(id:string)=>(await api.patch(`/notifications/${id}/read`)).data;
export const markAllNotificationsRead=async()=>(await api.patch("/notifications/read-all")).data;
export const deleteNotification=async(id:string)=>(await api.delete(`/notifications/${id}`)).data;
export const registerNotificationDevice=async(pushToken:string,platform:string)=>(await api.post("/notifications/device",{pushToken,platform})).data;
