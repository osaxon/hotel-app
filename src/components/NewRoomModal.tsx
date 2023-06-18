import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
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

// import { api } from "@/utils/api";

const FormSchema = z.object({
  roomNumber: z.string().min(1, {
    message: "Room number invalid.",
  }),
  roomName: z.string().min(3, {
    message: "Name must be at least 3 characters long.",
  }),
  roomTypeId: z.string(),
  capacity: z.coerce.number().min(1),
  image: z.any(),
});

export default function NewRoomModal() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  //   const { mutate: addRoom } = api.rooms.createRoom.useMutation({
  //     onSuccess: (data) => {
  //       toast({
  //         title: "You submitted the following values:",
  //         description: (
  //           <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //             <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //           </pre>
  //         ),
  //       });
  //     },
  //     onMutate: (variables) => {
  //       toast({
  //         title: "You submitted the following values:",
  //         description: (
  //           <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //             <code className="text-white">
  //               {JSON.stringify(variables, null, 2)}
  //             </code>
  //           </pre>
  //         ),
  //       });
  //     },
  //     onError: (error) => {
  //       toast({
  //         title: "There's been an error:",
  //         description: (
  //           <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
  //             <code className="text-white">{JSON.stringify(error, null, 2)}</code>
  //           </pre>
  //         ),
  //       });
  //     },
  //   });

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
    <AlertDialog>
      <AlertDialogTrigger>
        <PlusCircle size={56} className="hover:opacity-60" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        {/* form area */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Marvin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              defaultValue={0}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Submit
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
