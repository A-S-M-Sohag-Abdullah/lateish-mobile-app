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
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

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
    return data;
  } catch {
    return null;
  }
}

/** Register this device's token with the backend (best-effort). */
export async function registerPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) return;
  lastToken = token;
  try {
    await api.post("/push-tokens", {
      token,
      platform: Platform.OS,
      device_name: Device.deviceName ?? undefined,
    });
  } catch {
    // ignore — the user is still signed in; we retry next launch
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
