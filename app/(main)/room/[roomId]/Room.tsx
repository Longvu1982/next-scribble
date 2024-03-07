"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer } from "@/components/canvas/types";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider
      id="my-room"
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
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
