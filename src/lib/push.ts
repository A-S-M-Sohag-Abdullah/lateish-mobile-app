import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { api } from "./api";

// Foreground behaviour — show the banner + list entry and play a sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Remember the last token so we can unregister it on logout.
let lastToken: string | null = null;

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

/**
 * Ask for permission and resolve the device's Expo push token. Returns null on
 * a simulator/emulator (no push hardware) or when permission is denied. Remote
 * push requires a development/EAS build — it does not work in Expo Go.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("[push] not a physical device — no push token");
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") {
    console.warn("[push] notification permission not granted:", status);
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
    });
  }

  const projectId = getProjectId();
  try {
    const { data } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    console.log("[push] got Expo push token:", data);
    return data;
  } catch (err) {
    // On Android this throws when Firebase/FCM isn't configured in the build.
    console.error("[push] getExpoPushTokenAsync failed:", err);
    return null;
  }
}

/** Register this device's token with the backend (best-effort). */
export async function registerPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) {
    console.warn("[push] no token to register");
    return;
  }
  lastToken = token;
  try {
    await api.post("/push-tokens", {
      token,
      platform: Platform.OS,
      device_name: Device.deviceName ?? undefined,
    });
    console.log("[push] token registered with backend");
  } catch (err) {
    // ignore — the user is still signed in; we retry next launch
    console.error("[push] failed to register token with backend:", err);
  }
}

/** Unregister this device (called on logout) so it stops receiving pushes. */
export async function unregisterPushToken(): Promise<void> {
  const token = lastToken ?? (await getExpoPushToken());
  if (!token) return;
  try {
    await api.post("/push-tokens/remove", { token });
  } catch {
    // ignore
  }
  lastToken = null;
}
