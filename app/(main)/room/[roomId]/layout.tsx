import PlayerList from "@/components/PlayerList";
import Chat from "@/components/chat/Chat";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const layout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: { roomId: string };
}) => {
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

  const currentPlayer = players.find(
    (p) => p.profile.userId === currentProfile.user.id
  );

  return (
    <div className="container flex-1 mx-auto py-1">
      <div className="flex h-full gap-2">
        <PlayerList roomId={currentRoom.id} players={players} />
        <div className="flex-1 bg-zinc-200 rounded-sm">{children}</div>
        <Chat
          currentPlayer={currentPlayer}
          roomId={currentRoom.id}
          players={players}
        />
      </div>
    </div>
  );
};

export default layout;
