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

export function Overview() {
  const router = useRouter();

  const { data: reservations, isLoading } =
    api.reservations.getActiveReservations.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!reservations) return <>No data</>;

  const data = Array.from({ length: 6 }, (_, index) => {
    const weekStart = dayjs().startOf("week").add(index, "week");
    const weekEnd = dayjs().endOf("week").add(index, "week");
    const reservationsInWeek = reservations.filter((reservation) =>
      dayjs(reservation.checkIn).isBetween(weekStart, weekEnd, null, "[]")
    );
    const totalReservationsInWeek = reservationsInWeek.length;

    return {
      name: weekStart.format("MMM DD"),
      total: totalReservationsInWeek,
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
          onClick={(_data: unknown, _i: number) =>
            router.replace(`/reservations`)
          }
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
