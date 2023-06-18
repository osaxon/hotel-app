import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api } from "@/utils/api";
import dayjs from "dayjs";

interface Reservation {
  id: string;
  userId: string;
  createdAt: Date;
  checkIn: Date;
  checkOut: Date;
}

type RoomProps = {
  roomNumber: string;
  id: string;
  reservations: Reservation[];
  key: string;
  capacity: number;
};

interface ReservationsResponse {
  data: Reservation[];
  isLoading: boolean;
}

function upcomingReservations(reservations: Reservation[]) {
  return reservations.filter(
    (reservation) => !dayjs().isAfter(reservation.checkIn)
  );
}

export default function Room(props: RoomProps) {
  const { id: roomId, roomNumber, key } = props;
  const { data: reservations, isLoading } =
    api.reservations.getRoomReservations.useQuery({
      roomId,
    });

  return (
    <Card key={key}>
      <CardHeader>
        <CardTitle>Room Number: {roomNumber}</CardTitle>
        <CardDescription>Room Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger>
            Upcoming reservations: {reservations?.length || "0"}
          </CollapsibleTrigger>
          <CollapsibleContent></CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
