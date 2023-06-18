import { type GetServerSideProps } from "next";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";
import Link from "next/link";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import { BedDouble } from "lucide-react";
import LoadingSpinner from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CurrentGuestsCard from "@/components/CurrentGuestsCard";
import UpcomingReservationsCard from "@/components/UpcomingReservationsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Overview } from "@/components/Overview";
import NewRoomModal from "@/components/NewRoomModal";
import AdminLayout from "@/components/LayoutAdmin";
import { RecentSales } from "@/components/RecentSales";

export default function DashboardPage() {
  const {
    data: rooms,
    isLoading: isLoadingRooms,
    isError: isRoomsError,
  } = api.rooms.getAll.useQuery();

  if (isRoomsError) return <>Theres been an error</>;

  return (
    <>
      <AdminLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
            </div>
          </div>
          <Tabs defaultValue={"overview"} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CurrentGuestsCard />
                <UpcomingReservationsCard />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Reservations by Month</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Bar Orders</CardTitle>
                    <CardDescription>Last 24 hours.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Rooms tab */}
            <TabsContent value="rooms" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {rooms &&
                  rooms.map((room) => (
                    <Link key={room.id} href={`/room/${room.id}`}>
                      <Card>
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
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                {isLoadingRooms && (
                  <Card className="border border-dashed">
                    <LoadingSpinner />
                  </Card>
                )}

                <Card className="border border-dashed">
                  <CardContent className="flex h-full flex-col items-center justify-center p-0 py-10">
                    <NewRoomModal />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = getAuth(ctx.req);
  const ssg = generateSSGHelper();

  if (!session) {
    return {
      redirect: {
        destination: "/", // Redirect to a non-admin page
        permanent: false,
      },
    };
  }

  await ssg.rooms.getAll.prefetch();
  //   await ssg.reservations.getAll.prefetch();

  return {
    props: {
      // Your admin data here
      ...buildClerkProps(ctx.req),
      trpcState: ssg.dehydrate(),
    },
  };
};
