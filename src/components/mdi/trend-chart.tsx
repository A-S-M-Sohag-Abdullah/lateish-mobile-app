import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import type { TrendPoint } from "@/lib/mdi-data";

const H = 170;
const PAD_T = 12;
const PAD_B = 22;
const PAD_X = 6;

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

/** Polyline that draws itself in via an animated stroke-dashoffset. */
function DrawLine({
  pts,
  stroke,
  strokeWidth,
  dashed,
  progress,
}: {
  pts: { x: number; y: number }[];
  stroke: string;
  strokeWidth: number;
  dashed?: boolean;
  progress: SharedValue<number>;
}) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - progress.value),
  }));
  return (
    <AnimatedPolyline
      points={pointsStr}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "4 4" : `${len}`}
      animatedProps={dashed ? undefined : animatedProps}
      strokeOpacity={dashed ? 0.45 : 1}
    />
  );
}

/** Seasonal Trends: submitted / converted volume + conversion-rate line. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 900 });
  }, [data, w, progress]);

  const n = data.length;
  const leftMax = Math.max(1, ...data.map((p) => Math.max(p.submitted, p.converted)));
  const innerW = Math.max(0, w - PAD_X * 2);
  const x = (i: number) => PAD_X + (n <= 1 ? 0 : (i * innerW) / (n - 1));
  const yLeft = (v: number) => PAD_T + (1 - v / leftMax) * (H - PAD_T - PAD_B);
  const yRight = (v: number) => PAD_T + (1 - v / 100) * (H - PAD_T - PAD_B);

  const submitted = data.map((p, i) => ({ x: x(i), y: yLeft(p.submitted) }));
  const converted = data.map((p, i) => ({ x: x(i), y: yLeft(p.converted) }));
  const rate = data.map((p, i) => ({ x: x(i), y: yRight(p.convRate) }));

  return (
    <View className="gap-2">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && n > 0 ? (
          <Svg width={w} height={H}>
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
            <DrawLine pts={rate} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} dashed progress={progress} />
            <DrawLine pts={submitted} stroke="#94A3B8" strokeWidth={2} progress={progress} />
            <DrawLine pts={converted} stroke="#22C55E" strokeWidth={2.5} progress={progress} />
            {converted.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#22C55E" />
            ))}
          </Svg>
        ) : (
          <View style={{ height: H }} />
        )}
      </View>

      <View className="flex-row justify-between px-1">
        {data.filter((p) => p.label).map((p, i) => (
          <Text key={`${p.label}-${i}`} className="text-[10px] text-muted-foreground">
            {p.label}
          </Text>
        ))}
      </View>

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
