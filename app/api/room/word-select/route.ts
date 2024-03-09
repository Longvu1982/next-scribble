import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
    words: string[];
    currentWord: string;
    roomId: string;
};

export const POST = async (req: NextRequest) => {
    try {
        const { words, currentWord, roomId } = (await req.json()) as createRoomReq;

        if (!roomId) return new NextResponse("Room not found", { status: 420 });

        const room = await db.room.update({
            where: {
                id: roomId,
            },
            data: {
                words,
                currentWord,
                isDrawing: true,
            },
        });

        pusherServer.trigger(roomId, "select-word", currentWord);
        return NextResponse.json(room);
    } catch (err) {
        return new NextResponse("Internal Error", { status: 500 });
    }
};
