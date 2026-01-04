'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Contestant } from '@/lib/types';

interface ResultsChartProps {
  contestants: Contestant[];
}

export function ResultsChart({ contestants }: ResultsChartProps) {
  const chartData = contestants.map(c => ({ name: c.name, votes: c.votes }));

  const chartConfig = {
    votes: {
      label: 'Votes',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: 10,
            right: 10,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: 'hsl(var(--foreground))' }}
            style={{ fontSize: '12px' }}
            width={80}
          />
          <XAxis dataKey="votes" type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="votes" layout="vertical" fill="var(--color-votes)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
