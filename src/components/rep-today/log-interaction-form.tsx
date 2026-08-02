import {
  ChevronDown,
  ChevronUp,
  Mic,
  Square,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { CenteredPopup } from "@/components/ui/centered-popup";
import { Dropdown } from "@/components/ui/dropdown";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useOrganizations } from "@/hooks/use-organizations";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  useVoiceRecorder,
  type TranscribeResult,
} from "@/hooks/use-voice-recorder";
import {
  ACCOUNT_OPTIONS,
  ACCOUNT_PLACEHOLDER,
  BRAND_OPTIONS,
  FREQUENTLY_MISSED,
  INTERACTION_TYPE_OPTIONS,
  INTERACTION_TYPE_PLACEHOLDER,
  NEXT_ACTION_OPTIONS,
  NEXT_ACTION_PLACEHOLDER,
} from "@/lib/log-interaction-data";
import { cn } from "@/lib/utils";

interface LogInteractionFormProps {
  visible: boolean;
  onClose: () => void;
}

const AMBER = "#D9A441";

/** "Log Interaction" form popup, opened from the Rep Today page. */
export function LogInteractionForm({ visible, onClose }: LogInteractionFormProps) {
  const colors = useThemeColors();
  const { currentOrg } = useOrganizations();
  const orgId = currentOrg?.id ?? "";
  const [account, setAccount] = useState<string>(ACCOUNT_PLACEHOLDER);
  const [type, setType] = useState<string>(INTERACTION_TYPE_PLACEHOLDER);
  const [nextAction, setNextAction] = useState<string>(NEXT_ACTION_PLACEHOLDER);
  const [brands, setBrands] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  function toggleBrand(brand: string) {
    setBrands((b) =>
      b.includes(brand) ? b.filter((x) => x !== brand) : [...b, brand],
    );
  }

  function applyTranscription(result: TranscribeResult) {
    const parsed = result.parsed;
    if (parsed.interactionType) {
      const match = INTERACTION_TYPE_OPTIONS.find(
        (o) => o.toLowerCase() === parsed.interactionType!.toLowerCase(),
      );
      if (match) setType(match);
    }
    if (parsed.nextAction) {
      const match = NEXT_ACTION_OPTIONS.find(
        (o) => o.toLowerCase() === parsed.nextAction!.toLowerCase(),
      );
      if (match) setNextAction(match);
    }
    if (parsed.accountName) {
      const match = ACCOUNT_OPTIONS.find(
        (o) =>
          o.toLowerCase().includes(parsed.accountName!.toLowerCase()) ||
          parsed.accountName!.toLowerCase().includes(o.toLowerCase()),
      );
      if (match) setAccount(match);
    }
    if (parsed.brands.length > 0) {
      const matched = parsed.brands
        .map((b) =>
          BRAND_OPTIONS.find(
            (opt) =>
              opt.toLowerCase().includes(b.name.toLowerCase()) ||
              b.name.toLowerCase().includes(opt.toLowerCase()),
          ),
        )
        .filter((x): x is (typeof BRAND_OPTIONS)[number] => !!x);
      if (matched.length > 0)
        setBrands((b) => [...new Set<string>([...b, ...matched])]);
    }
    if (parsed.notes) {
      setNotes(parsed.notes);
      setNotesOpen(true);
    }
  }

  const recorder = useVoiceRecorder(orgId, (result) =>
    applyTranscription(result),
  );

  return (
    <CenteredPopup visible={visible} onClose={onClose} heightRatio={0.92}>
      <View className="flex-1">
        <View className="gap-2 px-6 pt-6">
          <Text className="text-3xl font-bold">Log Interaction</Text>
          <Text className="text-base text-muted-foreground">
            30 seconds, One interaction, All Brands updated.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() =>
              recorder.isRecording ? recorder.stop() : recorder.start()
            }
            disabled={recorder.isUploading}
            className={cn(
              "h-12 flex-row items-center justify-center gap-2 rounded-md border active:opacity-80",
              recorder.isRecording
                ? "border-red-500 bg-red-500/10"
                : "border-white bg-white/5",
              recorder.isUploading && "opacity-60",
            )}
          >
            {recorder.isUploading ? (
              <>
                <ActivityIndicator color={colors.foreground} size="small" />
                <Text className="text-base font-semibold text-foreground">
                  Transcribing…
                </Text>
              </>
            ) : recorder.isRecording ? (
              <>
                <Square color="#F87171" size={18} fill="#F87171" />
                <Text className="text-base font-semibold text-red-400">
                  Stop Recording · {recorder.secsLeft}s
                </Text>
              </>
            ) : (
              <>
                <Mic color={colors.foreground} size={20} />
                <Text className="text-base font-semibold text-foreground">
                  Record Interaction
                </Text>
              </>
            )}
          </Pressable>
          {recorder.error ? (
            <Text className="text-sm text-red-400">{recorder.error}</Text>
          ) : null}

          <View
            className="flex-row gap-2 rounded-xl border p-3"
            style={{ borderColor: "rgba(217,164,65,0.45)" }}
          >
            <TriangleAlert color={AMBER} size={18} />
            <View className="flex-1 flex-row flex-wrap items-center gap-1.5">
              <Text className="text-sm text-muted-foreground">
                Based on your last 12 debriefs, you frequently miss:
              </Text>
              {FREQUENTLY_MISSED.map((label) => (
                <View
                  key={label}
                  className="rounded-md border border-white/25 px-2 py-0.5"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {label}
                  </Text>
                </View>
              ))}
              <Text className="text-sm text-muted-foreground">
                — try to capture these today.
              </Text>
            </View>
          </View>

          <Field label="Account *">
            <Dropdown
              size="md"
              options={ACCOUNT_OPTIONS}
              value={account}
              onChange={setAccount}
              placeholder={ACCOUNT_PLACEHOLDER}
            />
          </Field>

          <Field label="Interaction Type *">
            <Dropdown
              size="md"
              options={INTERACTION_TYPE_OPTIONS}
              value={type}
              onChange={setType}
              placeholder={INTERACTION_TYPE_PLACEHOLDER}
            />
          </Field>

          <View className="flex-row gap-3">
            <Field label="Next Action *" className="flex-1">
              <Dropdown
                size="md"
                options={NEXT_ACTION_OPTIONS}
                value={nextAction}
                onChange={setNextAction}
                placeholder={NEXT_ACTION_PLACEHOLDER}
              />
            </Field>
            <Field label="Due Date *" className="flex-1">
              <View className="h-12 justify-center rounded-lg border border-input bg-input/30 px-4">
                <Text className="text-base text-muted-foreground">
                  dd/mm/yyyy
                </Text>
              </View>
            </Field>
          </View>

          <Field label="Brands Discussed *">
            <Input
              className="h-12"
              editable={false}
              placeholder="Select all brands in this conversation"
            />
            <View className="mt-2 flex-row flex-wrap gap-2">
              {BRAND_OPTIONS.map((brand) => {
                const selected = brands.includes(brand);
                return (
                  <Pressable
                    key={brand}
                    onPress={() => toggleBrand(brand)}
                    className={cn(
                      "rounded-lg border px-4 py-2",
                      selected
                        ? "border-brand-maroon bg-brand-maroon/10"
                        : "border-border bg-secondary",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm",
                        selected ? "text-white" : "text-muted-foreground",
                      )}
                    >
                      {brand}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Text className="text-sm leading-5 text-muted-foreground">
            Example: if you discussed Esther Rum pricing and showed Broken
            Barrier Tequilla samples, select both brands.
          </Text>

          <View>
            <Pressable
              onPress={() => setNotesOpen((o) => !o)}
              className="flex-row items-center gap-2"
            >
              <Text className="text-base font-medium text-foreground">
                Add Notes (optional)
              </Text>
              {notesOpen ? (
                <ChevronUp color={colors.foreground} size={18} />
              ) : (
                <ChevronDown color={colors.foreground} size={18} />
              )}
            </Pressable>
            {notesOpen ? (
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Write anything here"
                placeholderTextColor={colors.mutedForeground}
                multiline
                textAlignVertical="top"
                className="mt-2 h-24 rounded-lg border border-input bg-input/30 px-4 py-3 text-base text-foreground"
              />
            ) : null}
          </View>
        </ScrollView>

        <View className="px-6 pb-4 pt-3">
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="h-12 items-center justify-center rounded-xl bg-white active:opacity-90"
          >
            <Text className="text-base font-semibold text-black">
              Log Interaction
            </Text>
          </Pressable>
        </View>
      </View>
    </CenteredPopup>
  );
}
