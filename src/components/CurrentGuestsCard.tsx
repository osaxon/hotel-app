import { BedDouble } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { type Prisma } from "@prisma/client";

import { api } from "@/utils/api";
import LoadingSpinner from "./loading";
import { CardSkeleton } from "./CardSkeleton";

type ReservationWithRoom = Prisma.ReservationGetPayload<{
  include: { room: true };
}>;

export default function CurrentGuestsCard() {
  const { data: reservations, isLoading } =
    api.reservations.getActiveReservations.useQuery();

  if (!reservations) return <CardSkeleton />;
  if (isLoading) return <LoadingSpinner />;

  const checkedIn: ReservationWithRoom[] = reservations.filter(
    (reservation) => reservation.status === "CHECKED_IN"
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Checked In Guests</CardTitle>
        <BedDouble className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{checkedIn.length}</div>
      </CardContent>
    </Card>
  );
}
