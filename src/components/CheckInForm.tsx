import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn, convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Reservation } from "@prisma/client";
import { countries } from "countries-list";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingPage } from "./loading";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";

const FormSchema = z.object({
  guestName: z.string(),
  firstName: z.string(),
  surname: z.string(),
  guestEmail: z.string().email(),
  roomId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

export default function CheckInForm({
  reservationData,
}: {
  reservationData: Reservation;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      guestName: reservationData?.guestName || "",
      firstName: reservationData?.guestName.split(" ")[0],
      surname: reservationData?.guestName.split(" ")[1],
      guestEmail: reservationData?.guestEmail || "",
      roomId: reservationData?.roomId || "",
      checkIn: reservationData?.checkIn || undefined,
      checkOut: reservationData?.checkOut || undefined,
    },
  });

  const { data: rooms, isLoading: isLoadingRooms } =
    api.rooms.getVacanctRooms.useQuery();

  const { mutate: checkIn } = api.reservations.checkIn.useMutation({
    onSuccess: () => {
      form.reset(), void router.replace("/");
    },
    onError: (data) => {
      toast({
        title: "The data:",
        description: (
          <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    checkIn({ reservationId: reservationData?.id, ...data });
  }

  if (isLoadingRooms) return <LoadingPage />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <section className="grid w-2/3 grid-cols-1 gap-6 border md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    defaultValue={reservationData?.guestName.split(" ")[0]}
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
                    defaultValue={reservationData?.guestName.split(" ")[1]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-full">
            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      defaultValue={reservationData?.guestEmail ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {countries && (
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? convertToNormalCase(field.value)
                              : "Select country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {Object.entries(countries).map(([code, name]) => (
                              <CommandItem
                                value={name.name}
                                key={name.name}
                                onSelect={(value) => {
                                  form.setValue("address.country", value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    name.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {convertToNormalCase(name.name)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

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
                      // disabled={(date) =>
                      //   date > new Date() || date < new Date("1900-01-01")
                      // }
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                            {room.roomNumber} - {room.roomName} -{" "}
                            {room.roomType}
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
        </section>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
