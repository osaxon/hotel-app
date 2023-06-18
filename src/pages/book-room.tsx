import { type NextPage } from "next";
import Head from "next/head";
import { api } from "@/utils/api";
import { useStore } from "@/store/appStore";
import { useState } from "react";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble } from "lucide-react";

const Home: NextPage = () => {
  const selectedDate = useStore((state) => state.selectedDate);
  const [enabled, setEnabled] = useState(false);
  const startDate = selectedDate?.from || new Date();
  const endDate = selectedDate?.to || new Date();

  const { data: availableRooms } = api.rooms.getAvailable.useQuery(
    { startDate, endDate },
    { enabled: enabled, onSettled: () => setEnabled(false) }
  );

  return (
    <>
      <Head>
        <title>Book room</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <CalendarDateRangePicker />
          <Button onClick={() => setEnabled(!enabled)}>Search</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {availableRooms &&
            availableRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex flex-col">
                    <span className="text-2xl">{room.roomName}</span>
                  </CardTitle>

                  <CardDescription>
                    <Badge>{room.roomType}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Room {room.roomNumber}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BedDouble size={18} />
                    {room.capacity}
                  </span>
                  <span>
                    {room.isAvailable ? "Available" : "Not available"}
                  </span>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </>
  );
};

export default Home;
