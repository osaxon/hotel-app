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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/utils/api";
import { type Reservation } from "@prisma/client";
import { LoadingPage } from "./loading";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const FormSchema = z.object({
  customerName: z.string(),
  firstName: z.string(),
  surname: z.string(),
  customerEmail: z.string().email(),
  roomId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
});

export default function CheckInForm({
  reservationData,
}: {
  reservationData: Reservation;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      customerName: reservationData?.customerName || "",
      firstName: reservationData?.customerName.split(" ")[0],
      surname: reservationData?.customerName.split(" ")[1],
      customerEmail: reservationData?.customerEmail || "",
      roomId: reservationData?.roomId || "",
      checkIn: reservationData?.checkIn || undefined,
      checkOut: reservationData?.checkOut || undefined,
    },
  });

  const { data: rooms, isLoading: isLoadingRooms } =
    api.rooms.getVacanctRooms.useQuery();

  const { mutate: checkIn } = api.reservations.checkIn.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    checkIn({ reservationId: reservationData?.id, ...data });
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(
              { reservationId: reservationData?.id, ...data },
              null,
              2
            )}
          </code>
        </pre>
      ),
    });
  }

  if (isLoadingRooms) return <LoadingPage />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  defaultValue={reservationData?.customerName.split(" ")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  defaultValue={reservationData?.customerName.split(" ")[1]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  defaultValue={reservationData?.customerEmail ?? ""}
                />
              </FormControl>
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
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Room</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room for the guest" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms &&
                    rooms
                      .filter((room) => room.status === "VACANT")
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomNumber} - {room.roomName} - {room.roomType}
                        </SelectItem>
                      ))}
                  {isLoadingRooms ?? (
                    <SelectItem value="LOADING">Loading...</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
