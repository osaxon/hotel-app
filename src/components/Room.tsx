import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api } from "@/utils/api";

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

export default function Room(props: RoomProps) {
  const { id: roomId, roomNumber, key } = props;
  const { data: reservations } = api.reservations.getRoomReservations.useQuery({
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
