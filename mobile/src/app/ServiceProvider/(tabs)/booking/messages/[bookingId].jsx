import { useLocalSearchParams } from "expo-router";
import ConversationScreen from "../../../../../components/messages/ConversationScreen";
export default function ProviderBookingMessages() { const { bookingId, name } = useLocalSearchParams(); return <ConversationScreen bookingId={Array.isArray(bookingId) ? bookingId[0] : bookingId} participantName={Array.isArray(name) ? name[0] : name} />; }
