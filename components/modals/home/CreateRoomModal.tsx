import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { uuid } from "uuidv4";
import axios from "axios";
import * as z from "zod";
import { Profile, Room, RoomType } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CreateRoomModalProps {
    openType: "create" | "join" | "init";
    setOpenType: (type: "create" | "join" | "init") => void;
    profile: Partial<Profile>;
}

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required!",
    }),
    privacy: z.enum([RoomType.PUBLIC, RoomType.PRIVATE]),
});

const CreateRoomModal: FC<CreateRoomModalProps> = ({ openType, setOpenType, profile }) => {
    const [code, setCode] = useState<string>(uuid().slice(0, 6));
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            privacy: RoomType.PUBLIC,
        },
    });

    const privacy = form.watch("privacy");

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const payload = { ...values, code: values.privacy === RoomType.PUBLIC ? "" : code, profileId: profile.id };
        const { data }: { data: Room } = await axios.post("/api/room/create", payload);
        router.push(`room/${data.id}?started=false`);
    };

    return (
        <Dialog open={openType === "create"}>
            <DialogContent className="dark:bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-zinc-600">Create a new room</DialogTitle>
                    <DialogDescription>Create a new room!</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-8 mb-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base uppercase font-bold text-zinc-500 dark:text-secondary/70">Room name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                                                placeholder="Enter room name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="privacy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base uppercase font-bold text-zinc-500 dark:text-secondary/70">Set privacyy</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setCode(uuid().slice(0, 6));
                                                }}
                                                defaultValue={field.value}
                                                className="text-zinc-600 flex items-center gap-6"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value={RoomType.PUBLIC} className="text-zinc-500 bg-zinc-500" />
                                                    <span>Public</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem value={RoomType.PRIVATE} className="text-zinc-500 bg-zinc-500" />
                                                    <span>Private</span>
                                                </div>
                                                {privacy !== RoomType.PUBLIC && (
                                                    <div className="ml-auto flex items-center gap-2">
                                                        <span>Code:</span>
                                                        <Input value={code} className="text-zinc-200 w-[90px] ml-auto text-center" readOnly />
                                                    </div>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            ></FormField>
                        </div>
                        <DialogFooter>
                            <Button variant="primary" className="text-xl">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateRoomModal;
