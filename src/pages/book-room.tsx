import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";
import { useStore } from "@/store/appStore";
import { useState } from "react";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";

const Home: NextPage = () => {
  const selectedDate = useStore((state) => state.selectedDate);
  const [enabled, setEnabled] = useState(false);
  const startDate = selectedDate?.from || new Date();
  const endDate = selectedDate?.to || new Date();

  const {
    data: availableRooms,
    isLoading: loadingAvailableRooms,
    isError: errorLoadingRooms,
  } = api.rooms.getAvailable.useQuery(
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
          {availableRooms && JSON.stringify(availableRooms)}
        </div>
      </main>
    </>
  );
};

export default Home;
