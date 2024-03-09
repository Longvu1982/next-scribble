import React from "react";
import { Room } from "./Room";
import { Canvas } from "@/components/canvas/Canvas";
import { db } from "@/lib/db";
import RoomSetting from "@/components/room/RoomSetting";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const RoomPage = async ({ params }: { params: { roomId: string } }) => {
    const currentProfile = await getServerSession(authOptions);
    if (!currentProfile?.user) return redirect("/sign-in");

    const currentRoom = await db.room.findUnique({
        where: {
            id: params.roomId,
        },
        include: {
            players: {
                include: { profile: true },
            },
        },
    });

    if (!currentRoom) return redirect("/");

    const players = currentRoom.players ?? [];

    const currentPlayer = players.find((p) => p.profile.userId === currentProfile.user.id);

    return (
        <Room roomId={currentRoom.id}>
            {!currentRoom?.started && <RoomSetting currentRoom={currentRoom} profileId={currentProfile?.user.id} currentPlayer={currentPlayer} />}
            {currentRoom?.started && <Canvas currentPlayer={ currentPlayer} currentRoom={currentRoom} />}
        </Room>
    );
};

export default RoomPage;
