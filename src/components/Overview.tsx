import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { api } from "@/utils/api";
import LoadingSpinner, { LoadingPage } from "./loading";
import { useRouter } from "next/router";
dayjs.extend(isBetween);

export function Overview() {
  const router = useRouter();

  const {
    data: reservations,
    isLoading,
    isError,
  } = api.reservations.getActiveReservations.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!reservations) return <>No data</>;

  const data = Array.from({ length: 6 }, (_, index) => {
    const month = dayjs().add(index, "month");
    const reservationsInMonth = reservations.filter((reservation) =>
      dayjs(reservation.checkIn).isSame(month, "month")
    );
    const totalReservationsInMonth = reservationsInMonth.length;

    return {
      name: month.format("MMM"),
      total: totalReservationsInMonth,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value: number) => `${value}`}
        />
        <Tooltip />
        <Bar
          dataKey="total"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
          onClick={(data: any, i: number) => router.replace(`/admin/bookings/`)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
