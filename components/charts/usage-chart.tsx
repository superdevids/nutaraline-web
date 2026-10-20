"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/format";

/**
 * Formatting is selected by a string, not passed as a function: Server
 * Components cannot send functions across the client boundary.
 */
export type ValueFormat = "number" | "usd";

function formatValue(value: number, format: ValueFormat): string {
  return format === "usd" ? formatCurrency(value, "USD") : formatNumber(value);
}

export interface SeriesPoint {
  date: string;
  at?: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

const axisStyle = { fontSize: 10, fill: "#9bac9b" };

function ChartTooltip({
  active,
  payload,
  valueFormat,
}: {
  active?: boolean;
  payload?: {
    value?: number;
    payload?: { time?: string; day?: string };
  }[];
  valueFormat: ValueFormat;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const label = point?.day;
  const time = point?.time;

  return (
    <div className="rounded-md border border-border bg-bg-deep px-3 py-2 text-xs">
      <p className="mb-1 font-medium text-text">
        {label}
        {time ? ` · ${time}` : ""}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="tabular text-text-muted">
          {typeof entry.value === "number"
            ? formatValue(entry.value, valueFormat)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export function UsageAreaChart({
  data,
  metric,
  label,
  valueFormat = "number",
}: {
  data: SeriesPoint[];
  metric: "requests" | "tokens" | "cost";
  label: string;
  valueFormat?: ValueFormat;
}) {
  // Samples share a date, so the category axis must be the sample index. Using
  // the date as the key stacked four points on one tick and made every tooltip
  // report the first sample of the day.
  const chartData = data.map((point, index) => ({
    index,
    day: point.date.slice(5).replace("-", "/"),
    time: point.at ?? "",
    value:
      metric === "tokens" ? point.tokensIn + point.tokensOut : point[metric],
  }));

  // One tick per day: the index of each day's first sample.
  const dayTicks = chartData
    .filter((point) => point.time === "00:00" || point === chartData[0])
    .map((point) => point.index);

  return (
    <div className="h-64 w-[720px] min-w-0 sm:h-72 sm:w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28ba30" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#28ba30" stopOpacity={0} />
            </linearGradient>
            {/* Stroke runs accent → info so the line reads as a gradient, not a
                flat rule. Kept inside the server-safe palette. */}
            <linearGradient id="usageStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#28ba30" />
              <stop offset="100%" stopColor="#4a90d9" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#345436" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="index"
            type="number"
            domain={[0, Math.max(0, chartData.length - 1)]}
            ticks={dayTicks}
            tickFormatter={(value: number) => chartData[value]?.day ?? ""}
            tick={axisStyle}
            tickLine={false}
            axisLine={{ stroke: "#345436" }}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} />
          <Area
            type="monotone"
            dataKey="value"
            name={label}
            stroke="url(#usageStroke)"
            strokeWidth={2}
            fill="url(#usageFill)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: "#28ba30" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
