import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusherInstance";
import { RoomType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
  code: string;
  roomId: string;
  profileId: string;
};

export const POST = async (req: NextRequest) => {
  // try {
  const { code, roomId, profileId } = (await req.json()) as createRoomReq;

  if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

  const currentRoom = await db.room.findUnique({
    where: { id: roomId },
    include: { players: { include: { profile: true } } },
  });

  if (!currentRoom) return new NextResponse("Room not found", { status: 400 });

  const players = currentRoom.players;

  if (players.some((p) => p.profile.id === profileId)) {
    return NextResponse.json(currentRoom);
  }

  if (currentRoom.type === RoomType.PRIVATE && !code)
    return new NextResponse("This is a private room, please enter code!", {
      status: 420,
    });

  const updatedRoom = await db.room.update({
    where: { id: roomId, code: code },
    data: {
      players: {
        create: {
          profileId: profileId,
        },
      },
    },
    include: { players: { include: { profile: true } } },
  });

  if (!updatedRoom)
    return new NextResponse("Room not found or wrong code!", { status: 420 });

  await pusherServer.trigger(updatedRoom.id, "new-joiner", {
    players: updatedRoom.players,
  });

  return NextResponse.json(updatedRoom);
  // } catch (err) {
  //     return new NextResponse("Internal Error", { status: 500 });
  // }
};
