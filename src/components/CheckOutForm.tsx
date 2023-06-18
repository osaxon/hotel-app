import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/utils/api";

import { type Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const FormSchema = z.object({
  reservationId: z.string(),
  roomNumber: z.string().optional(),
  roomId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
});

type ReservationWithRoom = Prisma.ReservationGetPayload<{
  include: { room: true };
}>;

export default function CheckOutForm({
  reservationData,
}: {
  reservationData: ReservationWithRoom;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reservationId: reservationData?.id,
      roomId: reservationData?.roomId || "",
      checkIn: reservationData?.checkIn || undefined,
      checkOut: reservationData?.checkOut || undefined,
    },
  });

  const { mutate: calculatefinal } =
    api.reservations.calculateSubTotal.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    calculatefinal({
      reservationId: data.reservationId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify({ ...data }, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Room Number</FormLabel>
              <Input
                disabled
                className="w-[240px]"
                {...field}
                value={reservationData?.room?.roomNumber}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check In</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      defaultValue={
                        reservationData
                          ? format(new Date(reservationData.checkIn), "PPP")
                          : ""
                      }
                      disabled
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : reservationData?.checkIn ? (
                        format(new Date(reservationData.checkIn), "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkOut"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check Out</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      defaultValue={
                        reservationData
                          ? format(new Date(reservationData.checkOut), "PPP")
                          : ""
                      }
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : reservationData?.checkIn ? (
                        format(new Date(reservationData.checkOut), "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit">Update Final Bill</Button>
          <Button
            variant="destructive"
            disabled={reservationData.subTotalUSD === null}
            type="submit"
          >
            Check Out
          </Button>
        </div>
      </form>
    </Form>
  );
}
