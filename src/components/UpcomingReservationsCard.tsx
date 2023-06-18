import { BedDouble } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Reservation } from "@prisma/client";
import dayjs from "dayjs";
import { api } from "@/utils/api";
import LoadingSpinner from "./loading";
import { CardSkeleton } from "./CardSkeleton";

export default function UpcomingReservationsCard() {
  const {
    data: reservations,
    isLoading,
    isError,
  } = api.reservations.getActiveReservations.useQuery();

  if (!reservations) return <CardSkeleton />;
  if (isLoading) return <LoadingSpinner />;

  const thisMonth: Reservation[] = reservations.filter(
    (reservation) =>
      dayjs(reservation.checkIn).month() === dayjs().month() &&
      reservation.status !== "CHECKED_IN"
  );

  const nextMonth: Reservation[] = reservations.filter(
    (reservation) =>
      dayjs(reservation.checkIn).month() === dayjs().add(1, "month").month() &&
      reservation.status !== "CHECKED_IN"
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">
          Upcoming Reservations
        </CardTitle>
        <BedDouble className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {thisMonth.length}{" "}
          <span className="text-sm font-light italic">this month</span>
        </div>
        <div className="text-medium font-bold">
          {nextMonth.length}{" "}
          <span className="text-sm font-light italic">next month</span>
        </div>
      </CardContent>
    </Card>
  );
}
