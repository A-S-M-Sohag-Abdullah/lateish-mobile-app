import { useState } from "react";
import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { Text } from "@/components/ui/text";
import { REVENUE_AXIS_MAX, REVENUE_BARS } from "@/lib/mdi-data";

const H = 200;
const PAD_L = 40;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 26;
const BAR_W = 16;
const GAP = 6;
const TICKS = [0, 15, 30, 45, 60];
const MUTED = "#94A3B8";
const PROJECTED = "#64748B";
const ACTUAL = "#22C55E";

/** Intent-to-Revenue forecast: grouped Projected / Actual bars by month. */
export function RevenueChart() {
  const [w, setW] = useState(0);

  const plotH = H - PAD_T - PAD_B;
  const y0 = PAD_T + plotH;
  const y = (v: number) => PAD_T + (1 - v / REVENUE_AXIS_MAX) * plotH;
  const plotW = Math.max(0, w - PAD_L - PAD_R);
  const groupW = plotW / REVENUE_BARS.length;

  return (
    <View className="gap-3">
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={H}>
            {/* gridlines + y labels */}
            {TICKS.map((t) => (
              <Line
                key={`g${t}`}
                x1={PAD_L}
                x2={w - PAD_R}
                y1={y(t)}
                y2={y(t)}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
            ))}
            {TICKS.map((t) => (
              <SvgText
                key={`t${t}`}
                x={PAD_L - 6}
                y={y(t) + 3}
                fontSize={10}
                fill={MUTED}
                textAnchor="end"
              >
                {`£${t}k`}
              </SvgText>
            ))}

            {/* projected bars */}
            {REVENUE_BARS.map((d, i) => {
              const cx = PAD_L + groupW * i + groupW / 2;
              return (
                <Rect
                  key={`p${d.label}`}
                  x={cx - BAR_W - GAP / 2}
                  y={y(d.projected)}
                  width={BAR_W}
                  height={y0 - y(d.projected)}
                  rx={3}
                  fill={PROJECTED}
                />
              );
            })}
            {/* actual bars */}
            {REVENUE_BARS.map((d, i) => {
              const cx = PAD_L + groupW * i + groupW / 2;
              return (
                <Rect
                  key={`a${d.label}`}
                  x={cx + GAP / 2}
                  y={y(d.actual)}
                  width={BAR_W}
                  height={y0 - y(d.actual)}
                  rx={3}
                  fill={ACTUAL}
                />
              );
            })}
            {/* month labels */}
            {REVENUE_BARS.map((d, i) => (
              <SvgText
                key={`l${d.label}`}
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

      {/* legend */}
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
