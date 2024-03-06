"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Profile, Room } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface JoinRoomModalProps {
    openType: "create" | "join" | "init";
    setOpenType: (type: "create" | "join" | "init") => void;
    profile: Partial<Profile>;
}

const formSchema = z.object({
    roomId: z.string().min(1, {
        message: "ID is required!",
    }),
    code: z.string(),
});

const JoinRoomModal: FC<JoinRoomModalProps> = ({ openType, setOpenType, profile }) => {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomId: "",
            code: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload = { ...values, profileId: profile.id };
        const { data }: { data: Room } = await axios.post("/api/room/join", payload);
        router.push(`room/${data.id}?started=false`);
    };

    return (
        <Dialog open={openType === "join"}>
            <DialogContent className="dark:bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-zinc-600">Join an existing room</DialogTitle>
                    <DialogDescription>Join your friend&apos;s room!</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 mb-6">
                            <FormField
                                control={form.control}
                                name="roomId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base uppercase font-bold text-zinc-500 dark:text-secondary/70">Room ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                                                placeholder="Enter room ID"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base uppercase font-bold text-zinc-500 dark:text-secondary/70">Room Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                                                placeholder="Enter room code"
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
                                Join
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default JoinRoomModal;
