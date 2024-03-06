"use client";
import { pusherClient } from "@/lib/pusherInstance";
import { cn } from "@/lib/utils";
import { Player, Profile } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import UserAvatar from "./Avatar";

type PlayersWithProfile = Player & { profile: Profile };

interface PlayerListProps {
    players: PlayersWithProfile[];
    roomId: string;
}

const PlayerList: FC<PlayerListProps> = ({ players: serverPlayers, roomId }) => {
    const [players, setPlayers] = useState<(Player & { profile: Profile })[]>([]);

    useEffect(() => {
        setPlayers(serverPlayers);
    }, [serverPlayers]);

    useEffect(() => {
        pusherClient.subscribe(roomId);
        pusherClient.bind("new-joiner", ({ players: newPlayers }: { players: PlayersWithProfile[] }) => {
            console.log(newPlayers);
            if (newPlayers.length !== players.length) setPlayers(newPlayers);
        });
        return () => pusherClient.unsubscribe(roomId);
    }, [roomId]);

    return (
        <div className="flex flex-col gap-2 w-52 bg-zinc-800 rounded-sm p-">
            {players.map((player, index) => (
                <div className={cn("p-2 bg-zinc-800 flex items-center justify-between", index % 2 === 1 && "bg-zinc-700")} key={player.id}>
                    <span className="text-3xl">#1</span>
                    <div>
                        <p className="text-xs">{player.profile.name}</p>
                        <p className="text-base">Score: 200</p>
                    </div>
                    <UserAvatar src={player.profile.imageUrl} className="size-8" />
                </div>
            ))}
        </div>
    );
};

export default PlayerList;
