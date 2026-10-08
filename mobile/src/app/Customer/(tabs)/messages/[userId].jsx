import { useLocalSearchParams } from "expo-router";
import ConversationScreen from "../../../../components/messages/ConversationScreen";

export default function CustomerConversation() {
  const { userId } = useLocalSearchParams();
  return <ConversationScreen participantId={Array.isArray(userId) ? userId[0] : userId} />;
}
