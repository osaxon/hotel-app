import { api } from "@/utils/api";
import { useUser } from "@clerk/nextjs";
import { appConfig } from "app.config";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const RedirectPage: NextPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const email: string = user?.primaryEmailAddress?.emailAddress ?? "";

  const { data: isAdmin } = api.auth.isUserAdmin.useQuery({
    id: user?.id ?? "",
  });

  const guestRedirect = `/my-stay/${encodeURIComponent(email)}`;

  useEffect(() => {
    if (isLoaded) {
      if (isAdmin) {
        void router.replace("/dashboard");
      } else {
        void router.replace(guestRedirect);
      }
    }
  }, [email, guestRedirect, isAdmin, isLoaded, router]);

  return (
    <>
      <Head>
        <title>{appConfig.title ?? "Title"}</title>
        <meta name="description" content={appConfig.description ?? ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 "></div>
        {user?.firstName}
        {JSON.stringify(isAdmin)}
      </main>
    </>
  );
};

export default RedirectPage;
