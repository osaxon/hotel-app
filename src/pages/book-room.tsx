import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";

const Home: NextPage = () => {
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
        </div>
      </main>
    </>
  );
};

export default Home;
