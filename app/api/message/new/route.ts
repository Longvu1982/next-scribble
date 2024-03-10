import { getMessageType } from "@/components/canvas/utils";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { NextRequest, NextResponse } from "next/server";

type createMessageReq = {
  roomId: string;
  content: string;
  profileId: string;
  playerId: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const { content, roomId, playerId, profileId } =
      (await req.json()) as createMessageReq;

    if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

    const currentRoom = await db.room.findUnique({ where: { id: roomId } });

    const message = await db.message.create({
      data: {
        content,
        playerId,
        roomId,
        type: getMessageType(content, currentRoom?.currentWord),
      },
      include: {
        player: { include: { profile: true } },
      },
    });
    await pusherServer.trigger(roomId, "new-message", message);
    return NextResponse.json(message);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
