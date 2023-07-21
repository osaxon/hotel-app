import { formatCurrency } from "@/lib/utils";
import { api } from "@/utils/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useRouter } from "next/router";
import {
  Bar,
  BarChart,
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

  const maxSubTotal = Math.max(
    ...salesData.map((dataPoint) => dataPoint.subTotal)
  );

  return (
    <>
      {JSON.stringify(salesData)}
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
            domain={[0, Math.ceil(maxSubTotal * 1.2)]}
          />
          <Tooltip />
          <Bar dataKey="subTotal" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
