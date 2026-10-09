import type { CreateBookingData } from "./booking";

export interface BookingDraft {
  data: CreateBookingData;
  images: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
}

const bookingDrafts = new Map<string, BookingDraft>();

export function saveBookingDraft(draft: BookingDraft) {
  const draftId = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  bookingDrafts.set(draftId, draft);
  return draftId;
}

export function getBookingDraft(draftId: string) {
  return bookingDrafts.get(draftId) || null;
}

export function removeBookingDraft(draftId: string) {
  bookingDrafts.delete(draftId);
}
