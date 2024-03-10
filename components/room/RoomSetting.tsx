"use client";
import { pusherClient } from "@/lib/pusherInstance";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Player, Profile, Room } from "@prisma/client";

const formSchema = z.object({
  wordsList: z
    .string()
    .min(1, { message: "Words list is required." })
    .regex(/^([\p{L}\s]+)(,\s*[\p{L}\s]+)*$/u, {
      message: "Paste in list of words separate by a comma",
    }),
  // code: z.string(),
});

interface RoomSettingProps {
  currentRoom: Room & { players: (Player & { profile: Profile })[] };
  currentPlayer: A;
  profileId: string | undefined;
}

const RoomSetting: FC<RoomSettingProps> = ({
  currentRoom,
  currentPlayer,
  profileId,
}) => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wordsList: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const words = values.wordsList
      .replace("\n", "")
      .split(", ")
      .map((item: string) => item.trim());
    const payload = { words, roomId: currentRoom.id, profileId };
    await axios.post("/api/room/start", payload);
  };

  useEffect(() => {
    if (currentRoom.id) {
      pusherClient.bind("game-started", () => {
        router.refresh();
      });
    }
  }, [currentRoom.id]);

  return (
    <div className="p-4 h-full">
      {currentRoom.ownerId === currentPlayer.id ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 mb-6">
              <FormField
                control={form.control}
                name="wordsList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base uppercase font-bold text-zinc-500 dark:text-secondary/70">
                      Words list
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                        placeholder="Enter words list"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="primary" className="text-xl">
                Start
              </Button>
            </DialogFooter>
          </form>
        </Form>
      ) : (
        <div className="w-full h-full text-center flex items-center justify-center">
          <span className="text-zinc-600 text-2xl animate-bounce">
            Host is changing the settings...
          </span>
        </div>
      )}
    </div>
  );
};

export default RoomSetting;
