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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BoardType,
  ReservationItem,
  RoomType,
  RoomVariant,
} from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { convertToNormalCase } from "../lib/utils";
import { Input } from "./ui/input";

const FormSchema = z.object({
  description: z.string(),
  descForInvoice: z.string(),
  roomType: z.string(),
  roomVariant: z.string(),
  boardType: z.string(),
});

export default function ResItemForm({
  resItem,
}: {
  resItem?: ReservationItem;
}) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: resItem && resItem.description,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "The data:",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full shrink-0 space-y-6 md:w-1/2"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
          name="descForInvoice"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Invoice Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is how the booking will appear on the Invoice.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="roomType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(RoomType).map(([, type]) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roomVariant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(RoomVariant).map(([, type]) => (
                    <SelectItem className="uppercase" key={type} value={type}>
                      {convertToNormalCase(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="boardType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a board level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(BoardType).map(([, type]) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Save</Button>
          {resItem && (
            <Button variant="destructive" type="reset">
              De-activate
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
