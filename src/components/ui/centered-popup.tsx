import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface CenteredPopupProps {
  visible: boolean;
  onClose: () => void;
  /** Popup height as a fraction of the screen. */
  heightRatio?: number;
  children: React.ReactNode;
}

/**
 * A centred modal popup with a dimmed, tap-to-dismiss backdrop. Reusable shell
 * for form popups (Create Target, Record Actuals, …). Fades in rather than
 * sliding.
 */
export function CenteredPopup({
  visible,
  onClose,
  heightRatio = 0.85,
  children,
}: CenteredPopupProps) {
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* A Modal renders in its own view tree, so the root SafeAreaProvider does
          not reach it; without this any inset read inside would be 0. */}
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close"
            onPress={onClose}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
              width: "100%",
              maxWidth: 480,
              height: Math.round(height * heightRatio),
            }}
          >
            <View className="flex-1 overflow-hidden rounded-[24px] border border-white/10 bg-[#080E1B]">
              {children}
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}
