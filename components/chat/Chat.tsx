"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Message, Player, Profile } from "@prisma/client";
import { pusherClient } from "@/lib/pusherInstance";
import useCurrentProfile from "@/lib/hooks/store/useCurrentProfile";
import axios from "axios";
import UserAvatar from "../Avatar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const formSchema = z.object({
  content: z.string().min(1),
});

interface ChatProps {
  roomId: string;
  currentPlayer: Player | undefined;
  players: Player[];
}

type MessageWithData = Message & { player: Player & { profile: Profile } };

const Chat: FC<ChatProps> = ({ roomId, currentPlayer, players }) => {
  const [chats, setChats] = useState<MessageWithData[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [queryCursor, setQueryCursor] = useState<string | undefined>(undefined);
  const profile = useCurrentProfile((state) => state.profile);

  console.log(profile);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });
  const ref = useRef<A>();
  const chatRef = useRef<A>();
  const bottomRef = useRef<A>();

  const isLoading = form.formState.isSubmitting;

  console.log(players);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const payload = {
      ...values,
      roomId,
      profileId: profile.id,
      playerId: currentPlayer?.id,
    };
    await axios.post("/api/message/new", payload);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
    form.resetField("content");
  };

  const queryMessages = async () => {
    if (profile.id) {
      const { data } = await axios.post("/api/message/query", {
        profileId: profile.id,
        roomId,
        cursor: queryCursor,
      });
      setChats((prev) => [...prev, ...data.messages]);
      if (data.messages?.length < 15) {
        setHasMoreMessages(false);
      }
      setQueryCursor(data.cursor);
      console.log("data", data);
    }
  };

  useEffect(() => {
    queryMessages();
  }, [profile.id]);

  useEffect(() => {
    if (!isLoading) form.setFocus("content");
    ref.current?.focus();
  }, [isLoading]);

  useEffect(() => {
    pusherClient.subscribe(roomId);
    pusherClient.bind("new-message", (message: MessageWithData) =>
      setChats((prev) => [message, ...prev])
    );
  }, [roomId]);

  return (
    <div className="w-52 bg-zinc-600 rounded-sm flex flex-col">
      <div
        ref={chatRef}
        className="flex-1 h-[calc(100vh-200px)] max-h-[calc(100vh-100px)] flex flex-col overflow-y-scroll"
      >
        {hasMoreMessages ? (
          <Button onClick={queryMessages} variant="link">
            Load more messages
          </Button>
        ) : (
          <span className="italic text-center inline-block my-2">
            No more messages
          </span>
        )}
        <div className="flex flex-col-reverse">
          {chats.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "p-2 flex items-start gap-2",
                index % 2 === 1 && "bg-zinc-500"
              )}
            >
              <UserAvatar
                src={item.player?.profile?.imageUrl}
                className="size-6"
              />
              {item.content}
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="p-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Type your answer"
                      className=""
                      {...field}
                      ref={ref}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Chat;
