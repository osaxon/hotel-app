import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { appConfig } from "app.config";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{appConfig.title ?? "Title"}</title>
        <meta name="description" content={appConfig.description ?? ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Link href="/dashboard">Sign In</Link>
        </div>
      </main>
    </>
  );
};

export default Home;
