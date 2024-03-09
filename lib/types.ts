import { Player, Profile, Room } from "@prisma/client";

export type PlayerExtend = Player & { profile: Profile };

export type RoomExtend = Room & { players: PlayerExtend[] };
