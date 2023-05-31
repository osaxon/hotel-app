import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/Toaster";

import { api } from "@/utils/api";
import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);
