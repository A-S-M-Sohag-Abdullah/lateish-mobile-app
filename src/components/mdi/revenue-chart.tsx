import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import type { RevenueBar } from "@/lib/mdi-data";

const H = 200;
const PAD_L = 40;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 26;
const BAR_W = 16;
const GAP = 6;
const MUTED = "#94A3B8";
const PROJECTED = "#64748B";
const ACTUAL = "#22C55E";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** A bar that grows up from the baseline. */
function GrowBar({
  x,
  y0,
  yTarget,
  color,
  progress,
}: {
  x: number;
  y0: number;
  yTarget: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const full = y0 - yTarget;
  const animatedProps = useAnimatedProps(() => ({
    y: y0 - full * progress.value,
    height: Math.max(0, full * progress.value),
  }));
  return (
    <AnimatedRect x={x} width={BAR_W} rx={3} fill={color} animatedProps={animatedProps} />
  );
}

/** Intent-to-Revenue forecast: grouped Projected / Actual bars by month. */
export function RevenueChart({
  data,
  axisMax,
  symbol,
}: {
  data: RevenueBar[];
  axisMax: number;
  symbol: string;
}) {
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800 });
  }, [data, w, progress]);

  const plotH = H - PAD_T - PAD_B;
  const y0 = PAD_T + plotH;
  const y = (v: number) => PAD_T + (1 - v / axisMax) * plotH;
  const plotW = Math.max(0, w - PAD_L - PAD_R);
  const groupW = plotW / Math.max(1, data.length);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(axisMax * f));

  return (
    <View className="gap-3">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && data.length > 0 ? (
          <Svg width={w} height={H}>
            {ticks.map((t, i) => (
              <Line
                key={`g${i}`}
                x1={PAD_L}
                x2={w - PAD_R}
                y1={y(t)}
                y2={y(t)}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
            ))}
            {ticks.map((t, i) => (
              <SvgText
                key={`t${i}`}
                x={PAD_L - 6}
                y={y(t) + 3}
                fontSize={10}
                fill={MUTED}
                textAnchor="end"
              >
                {`${symbol}${t}k`}
              </SvgText>
            ))}

            {data.map((d, i) => {
              const cx = PAD_L + groupW * i + groupW / 2;
              return (
                <GrowBar
                  key={`p${i}`}
                  x={cx - BAR_W - GAP / 2}
                  y0={y0}
                  yTarget={y(d.projected)}
                  color={PROJECTED}
                  progress={progress}
                />
              );
            })}
            {data.map((d, i) => {
              const cx = PAD_L + groupW * i + groupW / 2;
              return (
                <GrowBar
                  key={`a${i}`}
                  x={cx + GAP / 2}
                  y0={y0}
                  yTarget={y(d.actual)}
                  color={ACTUAL}
                  progress={progress}
                />
              );
            })}
            {data.map((d, i) => (
              <SvgText
                key={`l${i}`}
                x={PAD_L + groupW * i + groupW / 2}
                y={H - 8}
                fontSize={10}
                fill={MUTED}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            ))}
          </Svg>
        ) : (
          <View style={{ height: H }} />
        )}
      </View>

      <View className="flex-row gap-4">
        <Legend color={PROJECTED} label="Projected" />
        <Legend color={ACTUAL} label="Actual" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
