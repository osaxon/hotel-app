import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { MainNav } from "@/components/MainNav";
import { UserNav } from "@/components/UserNav";
import { api } from "@/utils/api";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
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
import { ReservationsTable } from "@/components/ReservationsTable";
import { Button } from "@/components/ui/button";

const BookingsPage: NextPage = () => {
  const {
    data: reservations,
    isLoading,
    isError,
  } = api.reservations.getActiveReservations.useQuery();

  return (
    <>
      <AdminLayout>
        <section className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          </div>
          <div>
            <Link href="/bookings/new-booking">
              <Button>Add New</Button>
            </Link>
          </div>
          <section>
            <ReservationsTable />
          </section>
        </section>
      </AdminLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const ssg = generateSSGHelper();

  await ssg.reservations.getActiveReservations.prefetch();

  return {
    props: {
      trcpState: ssg.dehydrate(),
    },
  };
};

export default BookingsPage;
