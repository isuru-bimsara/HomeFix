import { Stack } from "expo-router";

export default function BookingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="create-booking" />
            <Stack.Screen name="confirm-booking" />
            <Stack.Screen name="booking-completed" />
            <Stack.Screen name="booking-details/[id]" />
            <Stack.Screen name="edit-booking/[id]" />
        </Stack>
    );
}
