import { Toaster } from "@/components/Toaster";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type AppType } from "next/app";
import { Toaster as HotToaster } from "react-hot-toast";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
      <Toaster />
      <HotToaster position="top-center" reverseOrder={false} />
      <ReactQueryDevtools initialIsOpen={false} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
