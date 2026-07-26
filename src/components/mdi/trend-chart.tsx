import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { Text } from "@/components/ui/text";
import { SEASONAL_TRENDS } from "@/lib/mdi-data";

const H = 170;
const PAD_T = 12;
const PAD_B = 22;
const PAD_X = 6;
const LEFT_MAX = 10; // volume axis
const RIGHT_MAX = 100; // conversion-rate axis

/** Seasonal Trends: submitted / converted volume + conversion-rate line. */
export function TrendChart() {
  const [w, setW] = useState(0);

  const n = SEASONAL_TRENDS.length;
  const innerW = Math.max(0, w - PAD_X * 2);
  const x = (i: number) => PAD_X + (n <= 1 ? 0 : (i * innerW) / (n - 1));
  const yLeft = (v: number) =>
    PAD_T + (1 - v / LEFT_MAX) * (H - PAD_T - PAD_B);
  const yRight = (v: number) =>
    PAD_T + (1 - v / RIGHT_MAX) * (H - PAD_T - PAD_B);

  const submitted = SEASONAL_TRENDS.map((p, i) => `${x(i)},${yLeft(p.submitted)}`).join(" ");
  const converted = SEASONAL_TRENDS.map((p, i) => `${x(i)},${yLeft(p.converted)}`).join(" ");
  const rate = SEASONAL_TRENDS.map((p, i) => `${x(i)},${yRight(p.convRate)}`).join(" ");

  return (
    <View className="gap-2">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={H}>
            {/* gridlines */}
            {[0, 0.5, 1].map((g) => (
              <Line
                key={g}
                x1={PAD_X}
                x2={w - PAD_X}
                y1={PAD_T + g * (H - PAD_T - PAD_B)}
                y2={PAD_T + g * (H - PAD_T - PAD_B)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
            ))}

            {/* conversion-rate (dashed) */}
            <Polyline
              points={rate}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {/* submitted */}
            <Polyline points={submitted} fill="none" stroke="#94A3B8" strokeWidth={2} />
            {/* converted */}
            <Polyline points={converted} fill="none" stroke="#22C55E" strokeWidth={2.5} />
            {SEASONAL_TRENDS.map((p, i) => (
              <Circle key={i} cx={x(i)} cy={yLeft(p.converted)} r={3} fill="#22C55E" />
            ))}
          </Svg>
        ) : (
          <View style={{ height: H }} />
        )}
      </View>

      {/* x labels */}
      <View className="flex-row justify-between px-1">
        {SEASONAL_TRENDS.filter((p) => p.label).map((p) => (
          <Text key={p.label} className="text-[10px] text-muted-foreground">
            {p.label}
          </Text>
        ))}
      </View>

      {/* legend */}
      <View className="flex-row flex-wrap gap-4">
        <Legend color="rgba(255,255,255,0.45)" label="Conv. Rate %" />
        <Legend color="#94A3B8" label="Submitted" />
        <Legend color="#22C55E" label="Converted" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
