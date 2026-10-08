const { Notification, NotificationDevice } = require("../models");
async function sendPush(tokens, notification) {
  if (!tokens.length) return;
  try { await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tokens.map((to) => ({ to, sound: "default", title: notification.title, body: notification.body, data: notification.data, channelId: "default" }))) }); }
  catch (error) { console.error("Push notification failed:", error.message); }
}
async function notifyUser(userId, payload) {
  if (!userId) return null;
  const notification = await Notification.create({ userId, ...payload, data: payload.data || {} });
  const devices = await NotificationDevice.findAll({ where: { userId }, attributes: ["pushToken"] });
  sendPush(devices.map((item) => item.pushToken), notification.toJSON());
  return notification;
}
async function notifyUsers(userIds, payload) { return Promise.all([...new Set(userIds)].map((id) => notifyUser(id, payload))); }
module.exports = { notifyUser, notifyUsers };
