import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { Plus, Send, Sparkles, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useNitaStore } from "@/store/nita.store";

interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const GREETING: Message = {
  id: 0,
  role: "assistant",
  text: "Hi 👋 I'm NITA, your Natural Intelligence for Trade Analytics! Ask me anything about your sales, inventory, market data, or how to use the platform.",
};

// Best-effort page label for the request context, from the current route.
const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/sales-map": "Sales Map",
  "/order-fulfilment": "Order Fulfilment",
  "/sku-performance": "SKU Performance",
  "/activity-hub": "Activity Hub",
};
function labelForPath(path: string): string {
  return PAGE_LABELS[path] ?? "NITA";
}

// NITA replies are HTML; RN has no HTML renderer, so flatten to text while
// keeping paragraph breaks and bullet markers.
function htmlToText(html: string): string {
  return html
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function NitaPanel() {
  const open = useNitaStore((s) => s.open);
  const setOpen = useNitaStore((s) => s.setOpen);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";

  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // Load prior conversation the first time the panel opens for this org.
  const { data: history } = useQuery({
    queryKey: ["nita-history", orgId],
    queryFn: () =>
      api.get<{ role: "user" | "assistant"; content: string }[]>(
        `/organizations/${orgId}/nita`,
      ),
    enabled: open && !!orgId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages([
        GREETING,
        ...history.map((m, i) => ({
          id: i + 1,
          role: m.role,
          text: m.role === "assistant" ? htmlToText(m.content) : m.content,
        })),
      ]);
    }
  }, [history]);

  // Keep the newest message in view.
  useEffect(() => {
    if (open) requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages, open]);

  const send = useMutation({
    mutationFn: (text: string) =>
      api.post<{ reply: string }>(`/organizations/${orgId}/nita`, {
        page: labelForPath(pathname),
        message: text,
      }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", text: htmlToText(data.reply) },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          text: "Something went wrong. Please try again.",
        },
      ]);
    },
  });

  const clear = useMutation({
    mutationFn: () => api.delete(`/organizations/${orgId}/nita`),
  });

  function handleSend() {
    const text = input.trim();
    if (!text || send.isPending) return;
    if (!orgId) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", text: "Please select an organization first." },
      ]);
      return;
    }
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    send.mutate(text);
  }

  function clearChat() {
    setMessages([GREETING]);
    setInput("");
    if (orgId) {
      clear.mutate();
      queryClient.setQueryData(["nita-history", orgId], []);
    }
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => setOpen(false)}
        />

        <View className="h-[88%]">
          <View
            className="flex-1 overflow-hidden rounded-t-3xl border border-border"
            style={{ paddingTop: insets.top > 0 ? 8 : 12 }}
          >
            {/* Background gradient (absolute fill so the View keeps the layout;
                LinearGradient doesn't reliably take flex from className). */}
            <LinearGradient
              colors={["#0A1429", "#060A13"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Drag handle */}
            <View className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-muted" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-1 flex-row items-center gap-3">
                <LinearGradient
                  colors={["#FBBF24", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles color="#0B1220" size={20} fill="#0B1220" />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-lg font-bold">NITA</Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    Natural Intelligence for Trade Analytics
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={clearChat}
                accessibilityLabel="Clear chat"
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
              >
                <Trash2 color="#EF4444" size={20} />
              </Pressable>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerClassName="gap-3 px-4 py-2"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View key={msg.id} className="gap-1">
                  {msg.role === "user" ? (
                    <Text className="pr-1 text-right text-xs text-muted-foreground">
                      You
                    </Text>
                  ) : null}
                  <View
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "self-end rounded-br-md bg-primary"
                        : "self-start rounded-bl-md bg-white/[0.06]",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base leading-6",
                        msg.role === "user" ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}

              {send.isPending ? (
                <View className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                  <ActivityIndicator color={colors.mutedForeground} size="small" />
                </View>
              ) : null}
            </ScrollView>

            {/* Input — a single pill holding the + icon and the field, with a
                separate send button (dark when empty, red once there's text).
                KeyboardStickyView translates this bar up to sit right above
                the keyboard instead of resizing the panel around it —
                KeyboardAvoidingView's resize approach never reliably
                revealed it on Android in this modal. */}
            <KeyboardStickyView>
              <View
                className="flex-row items-center gap-3 bg-[#060A13] px-4 pt-3"
                style={{ paddingBottom: insets.bottom + 10 }}
              >
                <View className="h-12 flex-1 flex-row items-center gap-2 rounded-full bg-white/[0.05] pl-4 pr-2">
                  <Plus color={colors.mutedForeground} size={22} />
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    placeholder="Ask NITA AI anything..."
                    placeholderTextColor={colors.mutedForeground}
                    maxLength={500}
                    returnKeyType="send"
                    className="h-full flex-1 text-base text-foreground"
                  />
                </View>
                <Pressable
                  onPress={handleSend}
                  disabled={!input.trim() || send.isPending}
                  accessibilityLabel="Send"
                  className={cn(
                    "h-12 w-12 items-center justify-center rounded-full active:opacity-90",
                    input.trim() ? "bg-[#7C1D1E]" : "bg-white/[0.05]",
                  )}
                >
                  <Send
                    color={input.trim() ? "#FFFFFF" : colors.mutedForeground}
                    size={20}
                  />
                </Pressable>
              </View>
            </KeyboardStickyView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
