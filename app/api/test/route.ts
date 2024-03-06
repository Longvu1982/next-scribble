import { pusherServer } from "@/lib/pusherInstance";

export const POST = (req: Request, res: Response) => {
    pusherServer.trigger("id123456", "test", { data: "hihi" });
    return new Response("");
};
