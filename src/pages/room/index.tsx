import type { GetStaticProps, NextPage } from "next";
import { api } from "@/utils/api";
import { LoadingPage } from "@/components/loading";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BedDouble } from "lucide-react";
import NewRoomModal from "@/components/NewRoomModal";
import AdminLayout from "@/components/LayoutAdmin";

const RoomAdminPage: NextPage = () => {
  const { data: rooms, isLoading: isLoadingRooms } =
    api.rooms.getAll.useQuery();

  if (isLoadingRooms) return <LoadingPage />;

  if (!rooms) return <div>404</div>;

  return (
    <>
      <AdminLayout>
        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Room Administration
            </h2>
          </div>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <Card className="border border-dashed">
              <CardContent className="flex h-full flex-col items-center justify-center p-0 py-10">
                <NewRoomModal />
              </CardContent>
            </Card>
          </section>
        </main>
      </AdminLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = generateSSGHelper();

  await ssg.rooms.getAll.prefetch();

  return {
    props: {
      trcpState: ssg.dehydrate(),
    },
  };
};

export default RoomAdminPage;
