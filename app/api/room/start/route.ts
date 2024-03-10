import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { RoomType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
  words: string[];
  profileId: string;
  playerId: string;
  roomId: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const { playerId, words, profileId, roomId } =
      (await req.json()) as createRoomReq;

    if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

    if (!roomId) return new NextResponse("Room not found", { status: 420 });

    const room = await db.room.update({
      where: {
        id: roomId,
      },
      include: {
        players: true,
      },
      data: {
        words,
        started: true,
      },
    });

    await pusherServer.trigger(roomId, "game-started", room);
    return NextResponse.json(room);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
