import { db } from "@/lib/db";
import { RoomType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type createRoomReq = {
    code: string;
    name: string;
    privacy: RoomType;
    profileId: string;
};

export const POST = async (req: NextRequest) => {
    try {
        const { code, name, privacy = RoomType.PUBLIC, profileId } = (await req.json()) as createRoomReq;

        if (!profileId) return new NextResponse("Unauthorize", { status: 401 });

        const room = await db.room.create({
            data: {
                name,
                code,
                type: privacy,
                ownerId: "",
                players: {
                    create: {
                        profileId: profileId,
                    },
                },
            },
        });

        console.log(room);
        return NextResponse.json(room);
    } catch (err) {
        return new NextResponse("Internal Error", { status: 500 });
    }
};
