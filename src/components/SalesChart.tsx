import { formatCurrency } from "@/lib/utils";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useRouter } from "next/router";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingSpinner from "./loading";
dayjs.extend(isBetween);

export function SalesChart() {
  const router = useRouter();

  const { data: salesData, isLoading } = api.pos.getTotalSales.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!salesData) return <>No data</>;

  salesData.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  const maxSubTotal = Math.max(
    ...salesData.map((dataPoint) => dataPoint.subTotal)
  );
  const maxTotalCost = Math.max(
    ...salesData.map((dataPoint) => dataPoint.totalCost)
  );

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={salesData}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency({ amount: Number(value) })}
            domain={[0, Math.ceil(Math.max(maxSubTotal, maxTotalCost) * 1.2)]}
          />
          <Tooltip />
          <Bar
            dataKey="subTotal"
            name="Total Sales"
            fill="#adfa1d"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="totalCost"
            name="Total Cost"
            fill="#ff0000"
            radius={[4, 4, 0, 0]}
          />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
