import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from "react-native";

type Props = ScrollViewProps & { keyboardVerticalOffset?: number };

export default function KeyboardAwareScrollView({
  keyboardVerticalOffset = 0,
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode = "on-drag",
  automaticallyAdjustKeyboardInsets = true,
  ...props
}: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        {...props}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
      />
    </KeyboardAvoidingView>
  );
}
