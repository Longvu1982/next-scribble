import { pusherServer } from "@/lib/pusherInstance";
import { Eraser } from "lucide-react";

export const POST = (req: Request, res: Response) => {
    pusherServer.trigger("id123456", "test", { message: "hihi" });
    return new Response("");
};
