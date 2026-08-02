import { useMutation } from "@tanstack/react-query";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";

export interface ParsedInteraction {
  accountName: string | null;
  interactionType: string | null;
  nextAction: string | null;
  notes: string | null;
  brands: {
    name: string;
    status: string;
    casePrice: number | null;
    blockerReason: string | null;
  }[];
  sentiment: "positive" | "neutral" | "negative";
}

export interface TranscribeResult {
  transcript: string;
  parsed: ParsedInteraction;
}

const MAX_SECS = 30;

/**
 * Field-note voice recording, mirroring the web app's flow:
 * record → upload to `voice-notes/transcribe-interaction` → hand the parsed
 * result back to the caller. Auto-stops at 30s with a live countdown.
 */
export function useVoiceRecorder(
  orgId: string,
  onResult: (result: TranscribeResult, durationSecs: number) => void,
) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const [secsLeft, setSecsLeft] = useState(MAX_SECS);
  const [error, setError] = useState("");
  const startedAtRef = useRef(0);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const { mutate: transcribe, isPending: isUploading } = useMutation({
    mutationFn: async ({ uri, duration }: { uri: string; duration: number }) => {
      const form = new FormData();
      // React Native FormData file part: { uri, name, type }.
      form.append("audio", {
        uri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as unknown as Blob);
      const result = await api.postForm<TranscribeResult>(
        `/organizations/${orgId}/voice-notes/transcribe-interaction`,
        form,
      );
      return { result, duration };
    },
    onSuccess: ({ result, duration }) => onResult(result, duration),
    onError: (e) =>
      setError(
        (e as Error).message ||
          "Could not process recording — check your connection and try again.",
      ),
  });

  const stop = useCallback(async () => {
    clearTimers();
    try {
      await recorder.stop();
    } catch {
      // recorder may already be stopped
    }
    const uri = recorder.uri;
    const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
    if (uri) transcribe({ uri, duration });
  }, [clearTimers, recorder, transcribe]);

  const start = useCallback(async () => {
    setError("");
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setError("Microphone access denied. Enable it in Settings and try again.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
      setSecsLeft(MAX_SECS);
      autoStopRef.current = setTimeout(() => {
        void stop();
      }, MAX_SECS * 1000);
      countdownRef.current = setInterval(() => {
        setSecsLeft((s) => (s <= 1 ? 0 : s - 1));
      }, 1000);
    } catch {
      setError("Could not start recording.");
    }
  }, [recorder, stop]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    isRecording: state.isRecording,
    isUploading,
    secsLeft,
    error,
    start,
    stop,
  };
}
