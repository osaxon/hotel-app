import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { api } from "@/utils/api";

import { cn } from "@/lib/utils";
import { type Reservation } from "@prisma/client";
import { ToastAction } from "@radix-ui/react-toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LoadingPage } from "./loading";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { toast } from "./ui/use-toast";

const FormSchema = z.object({
  guestName: z.string(),
  guestEmail: z.string().email(),
  returningGuest: z.boolean().default(false),
  guestId: z.string().optional(),
  checkIn: z.date(),
  checkOut: z.date(),
});

export default function NewBookingForm({}: { reservationData?: Reservation }) {
  const [runGuestQuery, setRunGuestQuery] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<string>("");

  const {
    data: guests,
    isLoading: isLoadingGuests,
    isError: isGuestsError,
  } = api.guests.getAll.useQuery();

  const { mutate: createReservation } =
    api.reservations.createReservation.useMutation({
      onSuccess: (data) => {
        toast({
          title: "New Reservation",
          description: (
            <div className="flex justify-between">
              <Check />
              <p>Reservation added</p>
            </div>
          ),
          action: <Link href={`/check-in/${data.id}`}>Check-In</Link>,
        });
      },
    });

  // Disabled by default. Query runs if a returning guest is selected.
  // Form fields then populated with response
  const { data: guestData } = api.guests.getById.useQuery(
    {
      id: selectedGuest,
    },
    {
      enabled: runGuestQuery,
      onSuccess: (data) => {
        form.setValue("guestName", data?.fullName ?? "");
        form.setValue("guestEmail", data?.email ?? "");
      },
    }
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      returningGuest: false,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // createReservation(data);

    // toast({
    //   title: "The data:",
    //   description: (
    //     <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });

    toast({
      title: "New Reservation",
      description: (
        <div className="flex justify-between">
          <Check />
          <p>Reservation added</p>
        </div>
      ),
      action: (
        <ToastAction altText="Go to check-in">Go to Check In</ToastAction>
      ),
    });
  }

  if (isGuestsError) {
    return <div>Error retrieving guest data.</div>;
  }

  if (isLoadingGuests || isLoadingGuests) return <LoadingPage />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="returningGuest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Return Guest</FormLabel>
                <FormDescription>
                  Guest has stayed before and information is held in system.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {form.getValues("returningGuest") ? (
          <>
            <FormField
              control={form.control}
              name="guestId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Guest</FormLabel>
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
                            ? guests.find((guest) => guest.id === field.value)
                                ?.fullName
                            : "Select Guest"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search framework..." />
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {guests.map((guest) => {
                            const fullName = `${guest.firstName} ${guest.surname}`;
                            return (
                              <CommandItem
                                value={guest.id}
                                key={guest.id}
                                onSelect={(value) => {
                                  form.setValue("guestId", value);
                                  setSelectedGuest(value);
                                  setRunGuestQuery(true);
                                }}
                              >
                                {guest.fullName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Guest Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        defaultValue={guestData?.fullName ?? field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      defaultValue={guestData?.email ?? field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Guest Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-In</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
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
              <FormLabel>Check-Out</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
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
                      date.valueOf() <
                      new Date(form.getValues("checkIn")).setHours(0, 0, 0, 0)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The check out date can be updated if the guest extends their
                stay.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit">Submit</Button>
          <Button
            variant="destructive"
            type="reset"
            onClick={() => {
              form.reset();
              setSelectedGuest("");
              setRunGuestQuery(false);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
