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
import { api } from "@/utils/api";
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
  roomType: z.nativeEnum(RoomType),
  roomVariant: z.nativeEnum(RoomVariant),
  boardType: z.nativeEnum(BoardType),
});

export default function ResItemForm({
  resItem,
}: {
  resItem?: ReservationItem;
}) {
  const [disabled, setDisabled] = useState<boolean>(true);
  const mode = resItem ? "UPDATE" : "NEW";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: resItem && resItem.description,
      descForInvoice: resItem?.descForInvoice ?? "",
      roomType: resItem?.roomType,
      roomVariant: resItem?.roomVariant,
      boardType: resItem?.boardType,
    },
  });

  const { mutate: update } = api.reservations.updateResItem.useMutation();
  const { mutate: create } = api.reservations.createResItem.useMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (mode === "NEW") {
      create(data);
    } else if (mode === "UPDATE" && resItem && resItem.id) {
      update({
        id: resItem.id,
        ...data,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full shrink-0 space-y-6 md:w-2/3"
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
