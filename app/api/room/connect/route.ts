import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
  roomId: string;
  playerId: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const { roomId, playerId } = (await req.json()) as createRoomReq;

    if (!roomId) return new NextResponse("Room not found", { status: 420 });

    await pusherServer.trigger(roomId, "connect", playerId);
    return NextResponse.json(playerId);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
