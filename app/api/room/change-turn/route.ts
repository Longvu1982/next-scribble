import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
  nextRound: boolean;
  currentDrawingId: string;
  currentRound: number;
  numberOfRound: number;
  roomId: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const { currentDrawingId, nextRound, roomId, currentRound, numberOfRound } =
      (await req.json()) as createRoomReq;

    if (!roomId) return new NextResponse("Room not found", { status: 420 });
    if (nextRound && currentRound === numberOfRound)
      return NextResponse.json({});

    await db.room.update({
      where: {
        id: roomId,
      },
      data: {
        currentDrawingId,
        currentRounds: nextRound ? currentRound + 1 : currentRound,
        finishedTurn: true,
        isDrawing: false,
      },
    });

    await pusherServer.trigger(roomId, "change-turn", {});
    return NextResponse.json({});
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
