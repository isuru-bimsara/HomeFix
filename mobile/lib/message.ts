import api from "./api";

export type MessageImage = {
  id: string;
  imageUrl: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  messageText?: string | null;
  images: MessageImage[];
  isEdited: boolean;
  isRead: boolean;
  createdAt: string;
};

function toFormData(text: string, images: any[], removeImages = false) {
  const form = new FormData();
  form.append("messageText", text);
  if (removeImages) form.append("removeImages", "true");
  images.forEach((image, index) => {
    form.append("images", {
      uri: image.uri,
      name: image.fileName || `message-${index}.jpg`,
      type: image.mimeType || "image/jpeg",
    } as any);
  });
  return form;
}

export async function getConversation(participantId: string) {
  const response = await api.get(`/messages/conversation/${participantId}`);
  return response.data;
}

export async function getConversations() {
  const response = await api.get("/messages/conversations");
  return response.data;
}

export async function getBookingConversation(bookingId: string) {
  const response = await api.get(`/messages/booking/${bookingId}`);
  return { ...response.data, participant: null };
}

export async function sendBookingMessage(bookingId: string, text: string, images: any[]) {
  const response = await api.post(`/messages/booking/${bookingId}`, toFormData(text, images), {
    headers: { "Content-Type": "multipart/form-data" }, timeout: 120000,
  });
  return response.data;
}

export async function sendMessage(participantId: string, text: string, images: any[]) {
  const response = await api.post(
    `/messages/conversation/${participantId}`,
    toFormData(text, images),
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
  );
  return response.data;
}

export async function updateMessage(
  messageId: string,
  text: string,
  images: any[],
  removeImages = false
) {
  const response = await api.patch(
    `/messages/${messageId}`,
    toFormData(text, images, removeImages),
    { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
  );
  return response.data;
}

export async function deleteMessage(messageId: string) {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
}
