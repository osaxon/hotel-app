import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";
import { env } from "@/env.mjs";

export const emailRouter = createTRPCRouter({
  sendEmail: privateProcedure
    .input(
      z.object({
        from: z.string().email(),
        to: z.string().email(),
        subject: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log({ ...input });
      const resend = new Resend(env.RESEND_API_KEY);

      try {
        const data = await resend.emails.send({
          ...input,
          react: EmailTemplate(),
        });
        console.log(data);
        if (!data) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send email.",
          });
        }
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: JSON.stringify(error),
        });
      }
    }),
});
