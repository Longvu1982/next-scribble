import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { RoomType } from "@prisma/client";
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

    console.log({ content, roomId, playerId, profileId });

    if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

    const message = await db.message.create({
      data: {
        content,
        playerId,
        roomId,
      },
      include: {
        player: { include: { profile: true } },
      },
    });
    pusherServer.trigger(roomId, "new-message", message);
    return NextResponse.json(message);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
