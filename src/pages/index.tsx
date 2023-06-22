import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { appConfig } from "app.config";
import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  const user = useUser();
  return (
    <>
      <Head>
        <title>{appConfig.title ?? "Title"}</title>
        <meta name="description" content={appConfig.description ?? ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {user.isSignedIn ? (
            <Button>
              <SignOutButton />
            </Button>
          ) : (
            <Button>
              <SignInButton mode="modal" />
            </Button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
