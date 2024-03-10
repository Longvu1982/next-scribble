"use client";

import { ReactNode, useEffect } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer } from "@/components/canvas/types";
import Loading from "@/components/Loading";
import { pusherClient } from "@/lib/pusherInstance";

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId?: string;
}) {
  useEffect(() => {
    if (!roomId) return;
    pusherClient.subscribe(roomId);
    return () => pusherClient.unsubscribe(roomId);
  }, [roomId]);

  return roomId ? (
    <RoomProvider
      id={roomId}
      initialPresence={{
        selection: [],
        cursor: null,
        pencilDraft: [],
        penColor: { r: 0, g: 0, b: 0 },
      }}
      initialStorage={{
        layers: new LiveMap<string, LiveObject<Layer>>(),
        layerIds: new LiveList(),
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  ) : (
    <></>
  );
}
