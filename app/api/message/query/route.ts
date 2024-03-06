import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type createMessageReq = {
  roomId: string;
  profileId: string;
  cursor: string;
};
const MESSAGE_BATCH = 15;
export const POST = async (req: NextRequest) => {
  // try {
  const { roomId, profileId, cursor } = (await req.json()) as createMessageReq;

  console.log({ roomId, profileId, cursor });

  if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

  const messages = await db.message.findMany({
    where: { roomId },
    take: MESSAGE_BATCH,
    orderBy: { createAt: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      player: { include: { profile: true } },
    },
  });

  let nextCursor = undefined;

  if (messages.length === MESSAGE_BATCH) {
    nextCursor = messages[MESSAGE_BATCH - 1].id;
  }

  return NextResponse.json({ messages: messages ?? [], cursor: nextCursor });
  // } catch (err) {
  //     return new NextResponse("Internal Error", { status: 500 });
  // }
};
