import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
  roomId: string;
  timeLeft: number;
  socketOnly: boolean;
};

export const POST = async (req: NextRequest) => {
  try {
    const { timeLeft, roomId, socketOnly } =
      (await req.json()) as createRoomReq;

    if (!roomId) return new NextResponse("Room not found", { status: 420 });

    const estimateTimeLeft = timeLeft > 0 ? timeLeft - 1 : timeLeft;

    if (!socketOnly)
      await db.room.update({
        where: {
          id: roomId,
        },
        data: {
          timeLeft: timeLeft > 0 ? timeLeft - 1 : timeLeft,
        },
      });

    pusherServer.trigger(roomId, "update-time", estimateTimeLeft);
    return NextResponse.json(estimateTimeLeft);
  } catch (err) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
