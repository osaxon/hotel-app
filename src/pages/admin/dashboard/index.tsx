import { type NextPage } from "next";
import { type GetServerSideProps } from "next";
import { LoadingPage } from "@/components/loading";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";
import Link from "next/link";
import { api } from "@/utils/api";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import Room from "@/components/Room";
import Image from "next/image";
import { Activity, CreditCard, BedDouble, Users, Plus } from "lucide-react";
import LoadingSpinner from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { MainNav } from "@/components/MainNav";
import { Overview } from "@/components/Overview";
import { RecentSales } from "@/components/RecentSales";
import { UserNav } from "@/components/UserNav";
import NewRoomModal from "@/components/NewRoomModal";

export default function DashboardPage() {
  const { data: rooms, isLoading: isLoadingRooms } =
    api.rooms.getAll.useQuery();

  const { data: reservations, isLoading: isLoadingReservations } =
    api.reservations.getAll.useQuery();

  return (
    <>
      <div className="flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Rooms
                    </CardTitle>
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingRooms ? (
                        <LoadingSpinner size={28} />
                      ) : (
                        rooms?.length
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Upcoming Reservations
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Link
                      href="/admin/dashboard/bookings"
                      className="text-2xl font-bold"
                    >
                      {isLoadingReservations ? (
                        <LoadingSpinner size={28} />
                      ) : (
                        reservations?.length
                      )}
                    </Link>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">
                      +19% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Now
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">
                      +201 since last hour
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Rooms tab */}
            <TabsContent value="rooms" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {rooms &&
                  rooms.map((room) => (
                    <Card key={room.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Room {room.roomNumber}
                        </CardTitle>
                        <CardContent>
                          <div className="text-3xl">{room.capacity}</div>
                        </CardContent>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                    </Card>
                  ))}
                <Card className="border-2 border-dashed">
                  <CardContent className="flex h-full flex-col place-items-center">
                    <NewRoomModal />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
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
  await ssg.rooms.getRoomTypes.prefetch();
  await ssg.reservations.getAll.prefetch();

  // Fetch your admin data here
  console.log(session);

  return {
    props: {
      // Your admin data here
      ...buildClerkProps(ctx.req),
      trpcState: ssg.dehydrate(),
    },
  };
};
