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
        const payload = { ...values, roomId, profileId: profile.id, playerId: currentPlayer?.id };
        const message = await axios.post("/api/message/new", payload);
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }, 100);
        form.resetField("content");
    };

    useEffect(() => {
        if (!isLoading) form.setFocus("content");
        ref.current?.focus();
    }, [isLoading]);

    useEffect(() => {
        pusherClient.subscribe(roomId);
        pusherClient.bind("new-message", (message: MessageWithData) => setChats((prev) => [...prev, message]));
    }, [roomId]);

    return (
        <div className="w-52 bg-zinc-600 rounded-sm flex flex-col">
            <div ref={chatRef} className="flex-1 h-[calc(100vh-200px)] max-h-[calc(100vh-100px)] flex flex-col overflow-y-scroll">
                {chats.map((item, index) => (
                    <div key={item.id} className={cn("p-2 flex items-center gap-2", index % 2 === 1 && "bg-zinc-500")}>
                        <div>
                            <UserAvatar src={item.player.profile.imageUrl} className="size-6" />
                        </div>
                        {item.content}
                    </div>
                ))}
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
                                        <Input disabled={isLoading} placeholder="Type your answer" className="" {...field} ref={ref} />

                                        {/* <Input
                                            disabled={isLoading}
                                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                                            placeholder="Enter room name"
                                            {...field}
                                        /> */}
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
